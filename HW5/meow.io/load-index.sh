#!/bin/bash
for i in {1..50}
do

    seq 1 10 | xargs -I {} -n1 -P4 curl -s localhost:3000/ >/dev/null
    #curl --request POST -H "Content-Type: application/json" --data '{"score": 1}' localhost:3000/fact/33/vote    
    # curl -F "image=@./data/morning.jpg" localhost:3000/upload

done
