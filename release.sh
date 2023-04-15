cd server

heroku container:push web --app denis-spices
heroku container:release web --app denis-spices

cd ..