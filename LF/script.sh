#!/bin/bash

source ~/my-env/bin/activate

cd ~/lost_and_found
python3 scraping.py
python3 items_lost.py

deactivate
