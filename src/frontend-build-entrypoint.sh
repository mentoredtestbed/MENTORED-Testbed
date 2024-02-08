# npm install
rm -rf dist
npm run build
rm -rf /build/dist/*
cp -r dist/* /build/dist/
