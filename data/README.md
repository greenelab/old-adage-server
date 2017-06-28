# The `data` Directory

## Overview

This directory contains files used for pre-loading our production server with
*Pseudomonas aeruginosa*-related samples and annotations. All of these files
are loaded into the system using the `import_data_and_index()` function in
[fabfile/adage_server.py](https://github.com/greenelab/adage-server/blob/master/fabfile/adage_server.py).
The
[adage/adage/configy.py.template file](https://github.com/greenelab/adage-server/blob/master/adage/adage/config.py.template)
specifies which files are loaded by the `import_data_and_index()` function.

## File Listing

* **PseudomonasAnnotation.tsv** lists samples retrieved from ArrayExpress along
  with manually-curated annotations for those samples.
* **all-pseudomonas-gene-normalized.pcl** contains normalized expression levels for
  every gene in each sample in the compendium.
* **all-pseudomonas-gene-normalized_HWActivity_perGene_with_net300_100models_1_100_k=300_seed=123_ClusterByweighted_avgweight_network_ADAGE.txt**
  contains signature (node) activity levels (as absolute values) for each
  sample in the compendium derived from the eADAGE machine learning model.
* **all-pseudomonas-gene-normalized_HWActivity_perGene_with_net300_100models_k=300_seed=123_ClusterByweighted_avgweight_network_ADAGE.txt**
  contains signature (node) activity levels for each sample in the compendium
  derived from the eADAGE machine learning model.
* **eADAGE_net300_allNodes_ADAGEnet_PAID_corCutoff0.4.txt** contains gene-gene
  network information derived from the eADAGE machine learning model.
* **node_gene_network.txt** lists high-weight genes participating in each
  signature (node) in the eADAGE machine learning model.
