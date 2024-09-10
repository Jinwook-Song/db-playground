import sqlite3

conn = sqlite3.connect("movies_download_origin.db")

cur = conn.cursor()

res = cur.execute("select movie_id, title from movies order by movie_id")

# cursor: 0
first_20 = res.fetchmany(20)
# cursor: 20
movie_21 = (res.fetchone(),)
# cursor: 21
rest = res.fetchall()
# cursor: end


# init_table()
conn.commit()
conn.close()
