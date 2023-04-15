cd ./client/

rm -rf ./www/

ng run app:build --baseHref="/static/"

rm -rf ../server/static
rm -rf ../server/templates
mkdir ../server/templates
mkdir ../server/static

cp -R ./www/* ../server/static
mv ../server/static/index.html ../server/templates/

cd ..