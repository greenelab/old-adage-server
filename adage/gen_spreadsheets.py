# coding: utf-8 (see https://www.python.org/dev/peps/pep-0263/)

from __future__ import print_function
from re import search
from glob import glob
from collections import namedtuple
import random
import unicodecsv as csv
import logging

_summary_url = "http://www.ebi.ac.uk/arrayexpress/experiments/%s/"
_spreadsheet_template = "{experiment}\t{sample}\t{celfile}\t\t\t\t\t\t\t\t\t\t"\
        "\t\t\t\t\t{description}\t=HYPERLINK(\"{summary}\")\n"
_sampleid_map_template = "{experiment}\t{sample}\t{celfile}\n"

# The utilities in this script are made to go hand-in-hand with those from
# get_pseudo_sdrf.py. For example, to download all .sdrf.txt files available
# at ArrayExpress into a directory and parse the files for the columns of
# interest for annotation, run the following two commands:
#
# > python -c "from get_pseudo_sdrf import *; download_sdrf_to_dir('data-20150518')"
# > python -c "from gen_spreadsheets import *; gen_spreadsheets(1, 1, 'data-20150518/')"
#
# If there are, say, three annotators available and it is desired to have every
# experiment annotated twice, the following command will create template data
# for populating three separate spreadsheets:
# > python -c "from gen_spreadsheets import *; ss_list = SpreadsheetGenerator('data-20150518/').distribute_experiments_to_annotators(3, 2); print('\n\n'.join(ss_list))"
# > python -c "from gen_spreadsheets import *; gen_spreadsheets(3, 2, 'data-20150518/')"

# Some notes about how to invoke this code for particular purposes:
#
# This will parse all .sdrf.txt files in directory 'data-20150519/' and format
# it using _spreadsheet_template
# > python -c "from gen_spreadsheets import *; print(SpreadsheetGenerator('data-20150519/').distribute_experiments_to_annotators(1, 1)[0])"
#
# This will parse all .sdrf.txt files in directory 'data-20150519/' and format
# it using _sampleid_map_template
# > python -c "from gen_spreadsheets import *; print(SpreadsheetGenerator('data-20150519/').generate_sampleid_map()[0])"
#
# This will reformat any file with experiment and sample in the first two
# columns to include a celfile in the third column
# > python -c "from gen_spreadsheets import *; insert_celfile_into_annotated_spreadsheet('../Dropbox-GreeneLab/ADAGE-annotation-results/Pseudomonas Annotation_complete.txt', 'data-20150528/')" | tm
#
# This will parse a generated spreadsheet file into a Spreadsheet object and
# print its string representation
# > python -c "from gen_spreadsheets import *; print(parse_spreadsheet('../Dropbox-GreeneLab/ADAGE-annotation-results/Pseudomonas Annotation_withCEL.txt'))"
#
# This will parse a generated spreadsheet file into a Spreadsheet object and
# print just the experiment's accession ID, sample ID, and medium
# > python -c "from gen_spreadsheets import *; ss = parse_spreadsheet('../Dropbox-GreeneLab/ADAGE-annotation-results/Pseudomonas Annotation_withCEL.txt'); print('\n'.join(['{accession}-{sample}: medium = {medium}'.format(**r._asdict()) for r in ss.rows()]))"


def main():
    """ Handle command-line invocation of this script """
    # TODO: read directory, num_annotators and coverage_level as
    #       command-line parameters
    gen_spreadsheets(3, 1, 'data-20150519/')


def gen_spreadsheets(num_ann=1, cov_lvl=1, dir_name='.'):
    """
    Convenience function for generating num_ann spreadsheets at coverage level
    cov_lvl from dir_name/*.sdrf.txt files
    """
    ss_list = SpreadsheetGenerator(dir_name).\
            distribute_experiments_to_annotators(num_ann, cov_lvl)
    for i in range(len(ss_list)):
        ss = ss_list[i]
        if len(ss_list) > 1:
            print("For annotator #{}:".format(i+1))
        print(ss)


# this method does not work as expected:
#   columns in SDRF files cannot be read positionally
# def parse_file():
#     # NOTE: this is a filter for one SDRF file. See
#     #       SpreadsheetGenerator.parse_dir() to handle a whole
#     #       directory at once.
#     sg = SpreadsheetGenerator()
#     fi = fileinput.input()
#     next(fi)        # skip the header line
#     experiment_name = sg.file_to_experiment_name(fi.filename())
#     exp_samples = ""
#     samples = sg.parse_sdrf(fi, experiment_name)
#     for s in samples:
#         exp_samples += (_spreadsheet_template.format(**s))
#     print(exp_samples, end='')


def insert_celfile_into_annotated_spreadsheet(spreadsheet_file, dir_name='.'):
    """
    Parse all .sdrf.txt files in dir_name to obtain a mapping between
    (experiment id, sample id) pairs and celfile (Array Data File) name and
    insert a new "celfile" column into spreadsheet_file after Experiment and
    Sample columns, leaving all other columns in spreadsheet_file unchanged
    Prints updated spreadsheet data to stdout.
    """
    sg = SpreadsheetGenerator(dir_name)
    mapdict = sg.generate_sampleid_map()[1]

    with open(spreadsheet_file, 'rb') as f:
        f_tsv = csv.reader(f, delimiter='\t')
        header = next(f_tsv)
        header.insert(2, "CEL file")
        print('\t'.join(header))
        for row in f_tsv:
            if len(row) > 0:
                if not (len(row[0]) > 0):
                    raise RuntimeError('No experiment ID provided: >%s<' % row)
                experiment_id = row[0]
                if not (len(row[1]) > 0):
                    raise RuntimeError('No sample ID provided: >%s<' % row)
                sample_id = row[1]
                if experiment_id not in mapdict:
                    logging.warning(
                        "Excluding sample {} – experiment {} not found."\
                        .format(sample_id, experiment_id))
                    continue
                if sample_id not in mapdict[experiment_id]:
                    # the sample_id may have been "cleaned up" by annotators,
                    # so we need to recover it
                    matches = [
                        s_id for s_id in mapdict[experiment_id].keys()
                        if s_id.endswith(sample_id) or \
                                s_id.startswith(sample_id)
                    ]
                    if len(matches) > 1:
                        raise RuntimeError(
                                'Too many matches for %s in experiment %s: %s' %
                                (sample_id, experiment_id, matches))
                    elif len(matches) == 1:
                        sample_id = matches[0]
                    # note no else: no matches are okay; there may be no .CEL
                    #               file for this one
                celfile = mapdict[experiment_id][sample_id] \
                        if sample_id in mapdict[experiment_id] else ""
                print('\t'.join([experiment_id, sample_id, celfile] + row[2:]))
            else:
                print()


class SpreadsheetGenerator(object):
    """
    Collection of methods for parsing a directory of downloaded sdrf.txt files
    and generating annotation spreadsheets for 'num_annotators' at a coverage
    level of 'coverage_level'. We generate 'num_annotators' spreadsheets in
    total and experiments are distributed to a total of 'coverage_level'
    annotators. If 'num_annotators' < 'coverage_level', then we raise an error.
    """
    def __init__(self, dir_name='.', num_annotators=3, coverage_level=2):
        super(SpreadsheetGenerator, self).__init__()
        self.dir_name = dir_name
        self.num_annotators = num_annotators
        self.coverage_level = coverage_level

    def parse_dir(self, dir_name=None):
        """
        Parse 'dir_name' for all *.sdrf.txt files and
        Return a list of experiments with corresponding file names (with
        relative paths)
        """
        if dir_name is None: dir_name = self.dir_name
        return self.parse_list(dir_name + "/*")

    def parse_list(self, file_glob):
        """
        Parse all .sdrf.txt files in file_glob
        Return a list of experiments with corresponding file names (with
        relative paths)
        """
        file_list = [file for file in glob(file_glob)
                if file.endswith(".sdrf.txt")]
        return([
            {'experiment_name': self.file_to_experiment_name(file),
             'file_name':       file
             } for file in file_list
         ])

    def file_to_experiment_name(self, file_name):
        """
        Extract the experiment name from the end portion of file_name
        Return the experiment name
        """
        if not file_name: raise RuntimeError('file_name is required')
        m = search(r'(?P<experiment_name>[^/]*).sdrf.txt$', file_name)
        if not m:
            raise RuntimeError(
                'Could not parse experiment name from .sdrf.txt file name ({})'\
                .format(file_name))
        return(m.group('experiment_name'))

    def distribute_experiments_to_annotators(
            self, num_annotators=None, coverage_level=None,
            experiment_list=None):
        """
        Iterate through experiment_list and generate num_annotators
        spreadsheets which distribute coverage_level copies of each experiment
        as evenly as possible to the annotators
        """
        if num_annotators is None: num_annotators = self.num_annotators
        if coverage_level is None: coverage_level = self.coverage_level
        if experiment_list is None: experiment_list = self.parse_dir()

        # validate: we need at least coverage_level annotators
        if num_annotators < coverage_level:
            raise RuntimeError(
                    ('Coverage level of {0} requested, but only {1} '
                     'annotator{2} available. ({1} < {0})'
                    ).format(
                        coverage_level, num_annotators,
                        "s" if num_annotators > 1 else ""
                    )
            )

        annotator_list = range(0, num_annotators)

        # Start out with num_annotators empty spreadsheet data files.
        # FIXME: spreadsheet data are stored in memory, so this approach will
        #        have practical limits
        spreadsheets = []
        for i in range(0, num_annotators):
            spreadsheets.append("")

        # For each experiment, randomly allocate annotation task to
        # 'coverage_level' of the 'num_annotators' annotators.
        # Iterate through downloaded files (see experiment_list) and generate
        # num_annotators spreadsheets while parsing each file.
        for exp in experiment_list:
            # assemble the block of samples from this experiment 'exp' into
            # rows to be added to the spreadsheet
            exp_samples = ""
            samples = self.parse_sdrf_file(**exp)
            for s in samples:
                exp_samples += (_spreadsheet_template.format(**s))

            # annotation of *this* experiment goes to 'recipients', as defined
            # by random sampling below
            recipients = random.sample(annotator_list, coverage_level)
            # helpful information for debugging
            # print("exp: %s \t recipients: %s" % (exp, recipients))
            for r in recipients:
                # now that we know which annotators get this experiment's
                # samples, we append them to the corresponding spreadsheet
                spreadsheets[r] += exp_samples
                # helpful to summarize this way for debugging
                # spreadsheets[r] += exp['experiment_name'] + "\n"

        return(spreadsheets)

    def generate_sampleid_map(self, experiment_list=None):
        """
        Iterate through experiment_list and read corresponding .sdrf.txt
        files.
        Return a tuple of the form (mapstr, mapdict), where mapstr is a
        string with lines corresponding to each sample using the
        _sampleid_map_template to format each line and mapdict is a dictionary
        mapping each experiment id to a dictionary of sample ids. The value
        for each sample id key is the "Array Data File" for that sample, if
        provided in the .sdrf.txt data file.
        The mapstr provides a simple database-friendly mapping table, while
        the mapdict can be used for efficiently generating a new "Array Data
        File" field from existing pairs of (experiment id, sample id)s.
        """
        if experiment_list is None: experiment_list = self.parse_dir()

        mapstr = ""
        mapdict = {}
        for exp in experiment_list:
            samples = self.parse_sdrf_file(**exp)
            for s in samples:
                mapstr += (_sampleid_map_template.format(**s))
                if s['experiment'] not in mapdict:
                    mapdict[s['experiment']] = {}
                mapdict[s['experiment']][s['sample']] = s['celfile']

        return(mapstr, mapdict)

    def parse_sdrf_file(self, file_name, experiment_name):
        """
        Open .sdrf.txt-formated file 'file_name', find the data elements we
        want in the headers and collect those data elements in the "samples"
        dictionary for each row in the file.
        Return a list of dictionaries with just the columns we wish to import
        into our Excel spreadsheet template for annontation.
        """
        with open(file_name, 'rb') as file:
            samples = []
            f_tsv = csv.reader(file, delimiter='\t')

            # grab the headers so we know what "layers" have our desired fields
            headers = next(f_tsv)
            sample_pos = headers.index("Source Name")
            celfile_pos = headers.index("Array Data File") \
                    if "Array Data File" in headers else -1
            description_poslist = [
                (pos, h) for pos, h in enumerate(headers)
                if h.startswith("Characteristics")
            ]

            # TODO: verify that this picks the right columns to pre-fill the
            # 'description' field
            for row in f_tsv:
                # need to verify the presence of data in row before parsing it
                # (we might have hit an empty row)
                if len(row) > 0:
                    description = ", ".join([
                        "{0} = {1}".format(h, row[pos])
                        for pos, h in description_poslist
                    ])
                    samples.append({
                        'experiment':   experiment_name,
                        'sample':       row[sample_pos],
                        'description':  description,
                        'summary':      (_summary_url % experiment_name),
                        'celfile':
                            row[celfile_pos] if celfile_pos >= 0 else "",
                    })
            return(samples)


def parse_spreadsheet(file_name):
    """
    parse the contents of file_name and
    return a Spreadsheet object
    """
    ss = Spreadsheet()
    with open(file_name, 'rb') as f:
        result = ss.parse_txt_file(f)

    return(result)


class Spreadsheet(object):
    """
    This class models a single annotation spreadsheet and includes methods for
    parsing a .txt version (tab-delimited UTF-8 text with a header row) of the
    annotated file using the same format produced by the SpreadsheetGenerator.
    """
    Headers = namedtuple('Headers',
        ['accession', 'sample', 'cel_file', 'strain', 'genotype', 'abx_marker',
        'variant_phenotype', 'medium', 'treatment',
        'biotic_int_lv_1', 'biotic_int_lv_2',
        'growth_setting_1', 'growth_setting_2', 'nucleic_acid', 'temperature',
        'od', 'additional_notes', 'description', 'expt_summary']
    )
    header_descriptions = Headers._make(
        ["experiment", "sample source", "CEL file", "strain", "genotype",
        "abx marker, auxotrophy",
        "variant phenotype (QS defective, mucoid, SCV, …)",
        "medium (biosynthesis/energy)", "treatment (drug/small molecule)",
        "biotic interactor level 1 (Plant, Human, Bacteria, …)",
        "biotic interactor level 2 "\
                "(Lung, epithelial cells, Staphylococcus aureus, …)",
        "growth setting (planktonic, colony, biofilm, …)",
        "growth setting "\
                "(For planktonic - aerated, static) "\
                "(For biofilms - flow cell, static, …)",
        "nucleic Acid", "temperature", "OD", "additional notes (markers)",
        "description (strain, replicates, and a brief glimpse of the exp.)",
        "experiment summary"]
    )
    _rows = []
    """a list containing the parsed spreadsheet data"""
    _experiment_sample_index = {}
    """
    an index for _rows with
    key: (experiment_accession, sample_id), val: index into _rows
    """

    def __str__(self):
        return "<Spreadsheet with %d rows>" % len(self._rows)

    def rows(self):
        """
        iterate over all rows in the Spreadsheet for ease in processing data
        """
        row_num = 0
        while row_num < len(self._rows):
            yield self._rows[row_num]
            row_num += 1

    def parse_txt_file(self, file_handle):
        """
        @file_handle: a file or stream with spreadsheet lines to parse,
        already opened for us with next line containing headers (ignored)
        returns: self, with file data appended to _rows
        """
        num_columns = len(self.Headers._fields)
        f_tsv = csv.reader(file_handle, delimiter='\t')
        headers = next(f_tsv)   # skip the header and read columns positionally
        if len(headers) != num_columns:
            raise RuntimeError(
                    'wrong number of columns found: %s' % '\t'.join(headers))

        for line_num, row in enumerate(f_tsv):
            if len(row) == 0:
                continue  # skip over empty rows
            if len(row) != num_columns:
                raise RuntimeError(
                        'wrong number of columns found at line %d' % line_num)
            self._rows.append(self.Headers._make(row))

        return(self)

    def get_experiment_ids(self):
        """
        return a list of all experiment ids culled from the first column of the
        spreadsheet file
        """
        return [r.accession for r in self.rows()]

    def get_sample_row(self, experiment_accession, sample_id):
        """
        Locate the spreadsheet row with the sample identified by
        `experiment_accession` and `sample_id` and return it.
        Build an index to speed the process if one is not already present.
        """
        if not self._experiment_sample_index:
            for row_num, row in enumerate(self._rows):
                self._experiment_sample_index[(row.accession, row.sample)] =\
                        row_num

        return(self._rows[
                self._experiment_sample_index[(experiment_accession, sample_id)]
            ])

    def get_column_summary(self):
        """
        summarize useful information about the contents in each column
        @return: a list with a tuple to describe each column:
            (min len, max len, has blank)
        """
        cols = zip(*self.rows())    # note: this gobbles memory, I'll bet
        lengths = [map(len, c) for c in cols]
        del cols

        minlen = map(min, lengths)
        maxlen = map(max, lengths)
        hasblank = [c == 0 for c in minlen]

        return self.Headers._make(zip(minlen, maxlen, hasblank))

    def generate_django_model(self):
        """
        generate code to use in the Django models.py based upon the data
        contained within this Spreadsheet
        @return: a string containing the text to use in the models.py source
        """
        field_def = """
{field_name} = models.CharField(
    "{field_desc}",
    max_length={field_maxlen},
    blank={field_blanks})"""
        col_summary = self.get_column_summary()
        double_round = lambda x: int(round(0.2*x)*10)

        model_fields = []
        for col_num, col in enumerate(col_summary):
            print(col)
            model_fields.append(field_def.format(
                field_name=col_summary._fields[col_num],
                field_desc=self.header_descriptions[col_num],
                field_maxlen=double_round(col[1]),
                field_blanks=col[2]))

        return '\n'.join(model_fields)


if __name__ == '__main__':
    main()
