#!/bin/bash -x

echo $PWD
ROOT=$PWD
SIM_B=$ROOT/simulation_B
SIM_A=$ROOT/simulation_A

mkdir -p $ROOT/tmp

cd $SIM_B
yarn -s start > $ROOT/tmp/sim_b.csv

cd $SIM_A
yarn -s start > $ROOT/tmp/sim_a.csv

cd $ROOT
python $ROOT/chart/plot_both.py
