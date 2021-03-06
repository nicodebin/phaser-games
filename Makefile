grooming-wars-deploy:
	git subtree push --prefix src/rpg-multiplayer-game heroku master

grooming-wars-deploy-force:
	git push heroku `git subtree split --prefix src/rpg-multiplayer-game master`:master --force

grooming-wars-start-prod:
	cd src/rpg-multiplayer-game && PORT=8084 heroku local web

grooming-wars-prod-logs:
	cd src/rpg-multiplayer-game && heroku logs --tail
