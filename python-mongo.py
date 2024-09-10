from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017")

database = client.get_database("movies")
movies = database.get_collection("movies")

query = {"director": "Christopher Nolan"}

results = movies.find(query)

for result in results:
    print(result)

client.close()
