import redis
import sqlite3
import json

r = redis.Redis(
    host="localhost",
    port=6379,
    decode_responses=True,
)

conn = sqlite3.connect("movies_download_origin.db")
cur = conn.cursor()


def make_expensive_query():
    redis_key = "director:movies"
    cached_results = r.get(redis_key)
    if cached_results:
        print("✅ cache hit")
        return json.loads(cached_results)
    else:
        print("⏳ cache miss")
        res = cur.execute(
            """
        SELECT count(*), director
        FROM movies
        GROUP BY director;
        """
        )
        all_rows = res.fetchall()
        r.set(redis_key, json.dumps(all_rows), ex=20)
        return all_rows


v = make_expensive_query()

conn.commit()
conn.close()
r.close()
