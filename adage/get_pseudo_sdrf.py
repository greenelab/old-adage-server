from __future__ import print_function
import urllib2
import json
import os
import re
from datetime import datetime
import pickle
import logging
import pprint

# Some notes about how to invoke this code for particular purposes:
#
# This will retrieve a list of URLs for only the .sdrf.txt files that have
# corresponding .raw data available
# > python -c "from get_pseudo_sdrf import *; get_sdrf_urls()" | egrep "^has" | cut -f 2
#
# This will download all available .sdrf.txt files into a directory named
# 'data-20150518' (and create the directory if needed)
# > python -c "from get_pseudo_sdrf import *; download_sdrf_to_dir('data-20150518')"
#
# This will download experiments matching the list supplied from all available
# .sdrf.txt files into a directory named 'data-20151002-subset' (and create the
# directory if needed)
# > python -c "from get_pseudo_sdrf import *; download_sdrf_to_dir('data-20151002-subset', experiment_list = ['E-GEOD-46947', 'E-MEXP-2396', 'E-MEXP-87'])"
#
# This will download only .sdrf.txt files with a companion raw file into a
# directory named 'data-20150521'
# > python -c "from get_pseudo_sdrf import *; download_sdrf_to_dir('data-20150521-haveraw', skip_experiments_without_raw_file=True)"
#
# This will retrieve a list of URLs for all .raw data available and print it
# (drop-compatible with the original get_pseudo.py)
# > python get_pseudo_sdrf.py
#
# This will retrieve ArrayExpress json experiment data and output a list of
# text fields for each experiment
# > python -c "from get_pseudo_sdrf import *; get_experiment_text()"
#
# This will print the contents of the JSON cache (cache will instantiate itself
# with defaults first, if needed)
# > python -c "from get_pseudo_sdrf import *; jc = JSON_cache(); jc.print_cache(full_dump=True)"
#
# This will print a summary of the JSON cache (cache will instantiate itself
# with defaults first, if needed)
# > python -c "from get_pseudo_sdrf import *; jc = JSON_cache(); jc.print_cache()"

# Define some known ArrayExpress URLs
_AEURL_FILES = "http://www.ebi.ac.uk/arrayexpress/json/v2/files?array=A-AFFY-30"
_AEURL_EXPERIMENTS = "http://www.ebi.ac.uk/arrayexpress/json/v2/"\
        "experiments?species=%22Pseudomonas%22"


def main():
    """
    Preserve the original function of get_pseudo.py by doing the same thing when
    running get_pseudo_sdrf.py
    """
    r = AERetriever()
    r.get_raw_urls()


def get_sdrf_urls():
    """
    Convenience function for retrieving a list of URLs for all .sdrf.txt files
    """
    r = AERetriever()
    r.get_sdrf_urls()


def download_sdrf_to_dir(
        dir_name, skip_experiments_without_raw_file=False,
        experiment_list=None):
    """ Convenience function for downloading .sdrf.txt files to 'dir_name' """
    logging.basicConfig(level=logging.INFO)
    logging.info("Experiment list: %s" % experiment_list)
    r = AERetriever()
    r.download_sdrf_to_dir(
            dir_name, skip_experiments_without_raw_file, experiment_list)


def get_experiment_text():
    """
    Convenience function for retrieving ArrayExpress json data and outputting
    experiment text
    """
    r = AERetriever(ae_url=_AEURL_EXPERIMENTS)
    # print(r.ae_json_to_experiment_text())
    expts = r.ae_json_to_experiment_text()
    for e in expts:
        print(e['name'].encode('utf-8'))


class AERetriever(object):
    """
    A collection of utility routines for retrieving and parsing pseudomonas
    experiment data from ArrayExpress. JSON responses from ArrayExpress are
    saved locally in a cache for efficent access.
    """
    def __init__(self, ae_url=_AEURL_FILES, cache_file_name=None):
        super(AERetriever, self).__init__()
        self.arrexp_url = ae_url
        if not cache_file_name:
            self.JSON_cache = JSON_cache()
        else:
            self.JSON_cache = JSON_cache(file_name=cache_file_name)
        self.data_jsonstr = self.get_ae_json()
        # need to initialize url_dict using only the ArrayExpress files JSON (probably cached)
        self.url_dict = self.ae_json_to_urls(self.get_ae_json(_AEURL_FILES))

    def get_raw_urls(self):
        """
        Retrieve a list of URLs for downloading raw CEL files for each
        pseudomonas-related experiment on ArrayExpress
        """
        for exp_urls in self.url_dict:
            if exp_urls['raw_urls']:
                # print all of the raw urls found for this experiment
                for raw_url in exp_urls['raw_urls']:
                    print(raw_url)

    def get_sdrf_urls(self):
        """
        Retrieve a list of URLs for downloading .sdrf.txt files for each
        pseudomonas-related experiment on ArrayExpress. Annotate the list with
        a note indicating if there are any raw files for this experiment.
        """
        for exp_urls in self.url_dict:
            has_raw_str = "has raw" if exp_urls['raw_urls'] else "no raw"
            print("%s\t%s" % (has_raw_str, exp_urls['sdrf_url']))

    def download_sdrf_to_dir(
            self, dir_name,
            skip_experiments_without_raw_file=False, experiment_list=None):
        """
        Download all of the .sdrf.txt files into directory dir_name for later
        use. If dir_name does not already exist, create it.
        If skip_experiments_without_raw_file is True, don't download those
        files. If experiment_list is supplied, filter the .sdrf.txt files so
        only experiments with names matching those on the list are downloaded.
        """
        if not os.path.isdir(dir_name):
            os.mkdir(dir_name)
        for exp_urls in self.url_dict:
            if skip_experiments_without_raw_file and not exp_urls['raw_urls']:
                continue
            # parse out a file name from the URL, then write each file
            m = re.search(
                    r'.*/(?P<f_name>(?P<e_name>.*)\.sdrf\.txt)',
                    exp_urls['sdrf_url'])
            if not m:
                raise RuntimeError(
                        'Could not parse .sdrf.txt file name from sdrf URL')
            f_name = m.group('f_name')
            e_name = m.group('e_name')
            if experiment_list is not None:
                if e_name not in experiment_list:
                    continue
            with open("%s/%s" % (dir_name, f_name), 'wb') as f_out:
                logging.info(
                        "Experiment %s: retrieving %s..." % (e_name, f_name))
                sdrf_uh = urllib2.urlopen(exp_urls['sdrf_url'])
                sdrf_data = sdrf_uh.read()
                sdrf_uh.close()
                f_out.write(sdrf_data)

    def get_ae_json(self, ae_url=None):
        """
        Obtain all pseudomonas-related data from the JSON interface to
        ArrayExpress

        Returns: a raw JSON string from the ArrayExpress JSON interface
        """
        if not ae_url: ae_url = self.arrexp_url
        ae_json_str = self.JSON_cache.get_jsonstr(ae_url)

        return(ae_json_str)

    def ae_json_to_urls(self, ae_json_str):
        """
        Parse the JSON response from ArrayExpress and extract the URL for raw
        data and for sdrf.txt

        Parse the JSON response from ArrayExpress for raw and sdrf files and
        return a list of URLs for raw CEL and sdrf.txt files to download for
        experiment details.

        Returns: a list of dictionaries with keys 'raw_urls' and 'sdrf_url'.
        """
        data = json.loads(ae_json_str)

        # extract a list of URLs for raw files and .sdrf.txt files
        url_list = []
        for experiment in data['files']['experiment']:
            files = experiment['file']
            raw_urls = []
            sdrf_url = None
            for fobj in files:
                # Loop through the entire list of files and extract what we want
                # NOTE: this code assumes at most one sdrf.txt file exists per
                # entry (but zero or more raw files may exist)
                if fobj['kind'] == 'raw':
                    raw_urls.append(fobj['url'])
                if fobj['kind'] == 'sdrf' and fobj['extension'] == 'txt':
                    sdrf_url = fobj['url']
            url_list.append({'raw_urls': raw_urls, 'sdrf_url': sdrf_url})

        return(url_list)

    def ae_json_to_experiment_text(self, ae_json_str=None):
        """
        Parse a JSON response from ArrayExpress and extract text that describes
        each experiment. If no ae_json_str is supplied, assume that
        self.arrexp_url is what we want to retrieve.

        Returns: a list of dictionaries with keys 'accession', 'name' and
        'description'.
        """
        # FIXME: it's potentially confusing that we've got sdrf parsing and
        #        experiment data parsing together
        if not ae_json_str: ae_json_str = self.get_ae_json(self.arrexp_url)
        data = json.loads(ae_json_str)

        # extract a list of URLs for raw files and .sdrf.txt files
        experiment_text = []
        for experiment in data['experiments']['experiment']:
            experiment_text.append({
                'accession': experiment['accession'],
                'name': experiment['name'],
                'description':
                    self._scrub_description(experiment['description']['text']),
            })

        return(experiment_text)

    def _scrub_description(self, desc):
        """
        if the ArrayExpress description text is a list rather than unicode, we
        have to piece it back together without the broken HTML markup

        Returns: properly concatenated unicode text for each description
        """
        if isinstance(desc, list):
            desc_text = []
            for section in desc:
                if isinstance(section, unicode):
                    desc_text.append(section)
                elif isinstance(section, dict):
                    if section == {u'br': None}: continue
                    try:
                        desc_text.append(section['a']['$'])
                    except Exception as e:
                        logging.warn(
                            'Could not scrub this text: {:s}'.format(desc))
                        raise e
            return(''.join(desc_text))
        elif isinstance(desc, unicode):
            return(desc)


class JSON_cache(object):
    """ maintain a cache of JSON strings indexed by retrieval URL """
    
    # number of seconds to keep cached data before refreshing
    REFRESH_INTERVAL = 24 * 60 * 60

    def __init__(self, file_name=".json_cache", refresh=REFRESH_INTERVAL):
        super(JSON_cache, self).__init__()
        self.file_name = file_name
        self.refresh = refresh
        if os.path.exists(self.file_name):
            _fr = open(self.file_name, 'rb')
            self._json_cache = pickle.load(_fr)
            _fr.close()
        else:
            _fw = open(self.file_name, 'wb')
            self.flush_cache(_fw)
            _fw.close()

    def populate_cache(self, url):
        """
        retrieve json data from URL and use it to populate our cache
        Returns: the JSON data that was retrieved
        """
        json_uh = urllib2.urlopen(url)
        jsonstr = json_uh.read()
        json_uh.close()
        self._json_cache[url] = {
            'cachedate': datetime.today(),
            'jsonstr': jsonstr,
        }
        pickle.dump(self._json_cache, open(self.file_name, 'wb'))
        return jsonstr

    def get_jsonstr(self, url):
        """
        retrieve json string from the cache, if available, otherwise download it
        """
        if url not in self._json_cache:
            logging.info("url <%s> not in cache. fetching..." % url)
            jsonstr = self.populate_cache(url)
        else:
            cachedict = self._json_cache[url]
            if (datetime.today() - cachedict['cachedate']).total_seconds() > \
                    self.refresh:
                # old data: refresh the cache
                logging.debug(
                    "old data (%s): refreshing the cache" % \
                    (datetime.today() - cachedict['cachedate']).total_seconds())
                jsonstr = self.populate_cache(url)
            else:
                logging.debug(
                    "cache is still fresh (%s)" % \
                    (datetime.today() - cachedict['cachedate']).total_seconds())
                jsonstr = cachedict['jsonstr']
        return jsonstr

    def flush_cache(self, file):
        """ purge the entire cache """
        self._json_cache = {}
        pickle.dump(self._json_cache, file)

    def print_cache(self, full_dump=False):
        """ print out the cache for examination """
        for url, cachedict in self._json_cache.items():
            print("url: {0}\ncachedate: {1}\n".format(
                url, cachedict['cachedate']
            ))
            if full_dump:
                # print(self._json_cache)
                print("jsonstr:\n{0}\n".format(
                    pprint.PrettyPrinter().pformat(
                        json.loads(cachedict['jsonstr'])
                    )
                ))


if __name__ == '__main__':
    main()
