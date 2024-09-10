import sqlite3

conn = sqlite3.connect("users.db")

cur = conn.cursor()


def init_table():
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            user_id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            password TEXT NOT NULL
        );
        """
    )
    cur.execute(
        """
        INSERT INTO users (username, password)
        VALUES ("jw", "123"), ("nico", "hello");
        """
    )


def print_all_users():
    res = cur.execute("SELECT * FROM users;")
    data = res.fetchall()
    print(data)


def change_password(username, password):
    cur.execute(
        f"""UPDATE users SET
        password = '{password}WHERE username = '{username};"""
    )


# SQL Injdection
change_password("jw", "hacked' --")


def change_password_secure(username, password):
    cur.execute(
        """UPDATE users SET
        password =? WHERE username =?;""",
        (password, username),
    )


change_password_secure("jw", "sql inject' --")


# init_table()
conn.commit()
print_all_users()
conn.close()
