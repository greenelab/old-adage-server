#!/bin/bash

# Script to load default Pseudomonas data (in the files included in this
# repository) into the adage-server database via management commands.
#
# *Note: This script uses relative paths to the locations of certain files,
# which means that this script must be run from the current directory.

script_directory=`dirname "${BASH_SOURCE[0]}" | xargs realpath`

cd $script_directory

# Import Pseudomonas annotation data
python manage.py import_data ../data/PseudomonasAnnotation.tsv

# Create Pseudomonas object in database for django-organisms
python manage.py organisms_create_or_update \
    --taxonomy_id=208964 \
    --scientific_name="Pseudomonas aeruginosa" \
    --common_name="Pseudomonas aeruginosa"

# Add new machine learning model into database
python manage.py add_ml_model "Ensemble ADAGE 300" 208964 --g2g_edge_cutoff 0.4

# Import activity data into the database:
python manage.py import_activity \
    ../data/all-pseudomonas-gene-normalized_HWActivity_perGene_with_net300_100models_k=300_seed=123_ClusterByweighted_avgweight_network_ADAGE.txt \
    "Ensemble ADAGE 300"

# Save PseudoCAP Cross-reference Database
python manage.py genes_add_xrdb \
    --name=PseudoCAP \
    --URL=http://www.pseudomonas.com/getAnnotation.do?locusID=_REPL_

# Retrieve data file for PAO1 genes and load it:
wget -qO - "ftp://ftp.ncbi.nih.gov/gene/DATA/GENE_INFO/Archaea_Bacteria/Pseudomonas_aeruginosa_PAO1.gene_info.gz" \
    | zcat > ../data/Pseudomonas_aeruginosa_PAO1.gene_info

# Call genes_load_geneinfo to populate the database:
python manage.py genes_load_geneinfo \
    --geneinfo_file=../data/Pseudomonas_aeruginosa_PAO1.gene_info \
    --taxonomy_id=208964 \
    --systematic_col=3 \
    --symbol_col=2 \
    --put_systematic_in_xrdb=PseudoCAP

wget -qO - "ftp://ftp.ncbi.nih.gov/gene/DATA/gene_history.gz" \
    | zcat > ../data/gene_history

python manage.py genes_load_gene_history ../data/gene_history 208964 \
    --tax_id_col=1 \
    --discontinued_id_col=3 \
    --discontinued_symbol_col=4

# Import gene-gene network data into the database:
python manage.py import_gene_network \
    ../data/eADAGE_net300_allNodes_ADAGEnet_PAID_corCutoff0.4.txt \
    "Ensemble ADAGE 300"

# Note that the ParticipationType "High-weight genes" has been
# created in: migrations/0009_auto_20170503_1700.py
# Import node-gene participation data into the database:
python manage.py import_node_gene_network ../data/node_gene_network.txt \
    "Ensemble ADAGE 300" \
    "High-weight genes"

python manage.py import_gene_sample_expr \
    ../data/all-pseudomonas-gene-normalized.pcl \
    208964

python manage.py tribe_client_pickle_public_genesets

# Build haystack search indexes:
python manage.py update_index
