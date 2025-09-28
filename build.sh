rm -rf precompiled-ui-dist || true
cd pipelane-server
npm run gen 
npm run build
mv client/dist ../precompiled-ui-dist