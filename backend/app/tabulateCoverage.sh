#!/bin/sh 

flag=0
echo "<details><summary>Expand for test coverage</summary><table>"
while IFS= read -r line; do
  if [ "$flag" -eq 0 ]; then
    echo "<tr><td>Name</td><td>Stmts</td><td>Miss</td><td>Cover</td></tr>"
    flag=1
  elif [ $(echo "$line" | cut -c1) != "-" ]; then
    set -- $line
    echo "<tr><td> $1 </td><td> $2 </td><td> $3 </td><td> $4 </td></tr>"
  fi
done
echo "</table></details>"