#!/bin/bash -x

echo $PWD
ROOT=$PWD
SIM_1=$ROOT/simulation_1
SIM_2=$ROOT/simulation_2

mkdir -p $ROOT/tmp

cd $SIM_1
yarn -s start > $ROOT/tmp/sim_1.csv

cd $SIM_2
yarn -s start > $ROOT/tmp/sim_2.csv

cd $ROOT
python $ROOT/chart/plot_both.py
