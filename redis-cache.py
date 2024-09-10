import redis

r = redis.Redis(
    host="localhost",
    port=6379,
    decode_responses=True,
)

r.set("hello", "world")

print(r.get("hello"))

r.hset(
    "users:1",
    mapping={
        "name": "jw",
        "age": 31,
    },
)

print(r.hgetall("users:1"))
