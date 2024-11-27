version=$1

git tag $version -m "v{$version}"
git push origin tag $version

cd mentored-backend
git tag $version -m "v{$version}"
git push origin tag $version
cd mentored-master
git tag $version -m "v{$version}"
git push origin tag $version
cd ../../

cd mentored-frontend
git tag $version -m "v{$version}"
git push origin tag $version
cd ../