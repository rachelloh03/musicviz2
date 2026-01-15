# Run React app:
- Frontend:  http://localhost:5173/
  - cd desktop/musicviz2/client
  - npm run dev
- Backend:
  - cd desktop/musicviz2/server
  - node index.js
 
# Simulate sending osc messages:
- clone: https://github.com/lancelotblanchard/jordanai-osctools
- download sound font: https://www.polyphone.io/en/soundfonts/pianos/744-nord-romantic-grand
- run: python oscPlayback.py tokens.txt 127.0.0.1 9005 --synth “Nord Romantic Grand.sf2”
