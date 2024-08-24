| 프로젝트 기간 | 24.08.23 ~                                                             |
| ------------- | ---------------------------------------------------------------------- |
| 프로젝트 목적 | Study SQL                                                              |
| Github        | https://github.com/Jinwook-Song/db-playground                          |
| docs          |                                                                        |
| sample data   | https://pub-f13217639d6446309ebabc652f18d0ad.r2.dev/movies_download.db |

---

SQL Editor: Beekeper Studio, TablePlus

## Data Definition Language (DDL)

- 데이터베이스가 어떠한 데이터를 가질지 정의하는 명령어

```sql
CREATE TABLE movies (
  title,
  released,
  overview,
  rating,
  director
);

DROP TABLE movies;
```

- 데이터 타입 정의

```sql
CREATE TABLE movies (
  title TEXT,
  released INTEGER,
  overview TEXT,
  rating REAL,
  director TEXT,
  for_kids INTEGER -- 0 or 1
  -- poster BLOB -- binary large object
) STRICT; -- type constraints
```

- Constraints

```sql
CREATE TABLE movies (
  title TEXT UNIQUE NOT NULL,
  released INTEGER NOT NULL,
  overview TEXT NOT NULL,
  rating REAL NOT NULL,
  director TEXT,
  for_kids INTEGER NOT NULL DEFAULT 0 -- 0 or 1
  -- poster BLOB -- binary large object
) STRICT; -- type constraints
```

- Check Constraints

```sql
CREATE TABLE movies (
  title TEXT UNIQUE NOT NULL,
  released INTEGER NOT NULL CHECK (released > 0),
  overview TEXT NOT NULL,
  rating REAL NOT NULL CHECK (rating BETWEEN 0 AND 10),
  director TEXT,
  for_kids INTEGER NOT NULL DEFAULT 0 CHECK (for_kids BETWEEN 0 AND 1) -- 0 or 1
  -- poster BLOB -- binary large object
) STRICT; -- type constraints

-- CHECK이 참인 경우만 데이터베이스에 입력이 가능하다
```

- function ([sqlite](https://sqlite.org/lang_corefunc.html))

sql 자체로 제한 할 수 없는 경우 function을 사용할 수 있다.

```sql
  overview TEXT NOT NULL CHECK (LENGTH(overview) < 100),
```

- primary key
  - 고유성, 불변성
  - 자연 기본키 (natural primary key) → 데이터와 논리적 관계가 있다. title을 자연 기본 키로 사용할 수 있음
  - 대체 기본키(surrogate primary key) → 데이터와 관계없이 오직 primary key를 위해 생성 ex) movie_id
  - 대체 기본키를 사용하는것이 좋다. 불변성을 유지하기 어려움

```sql
CREATE TABLE movies (
  id INTEGER PRIMARY KEY AUTOINCREMENT, -- 항상 새롭고, 고유한 키를 보장
  title TEXT UNIQUE NOT NULL,
  released INTEGER NOT NULL CHECK (released > 0),
  overview TEXT NOT NULL CHECK (LENGTH(overview) < 100),
  rating REAL NOT NULL CHECK (rating BETWEEN 0 AND 10),
  director TEXT,
  for_kids INTEGER NOT NULL DEFAULT 0 CHECK (for_kids BETWEEN 0 AND 1) -- 0 or 1
  -- poster BLOB -- binary large object
) STRICT; -- type constraints
```

## Data Manipulation Langugae (DML)

- 데이터 조작 언어
- Two categories: `update commands` and `query command`

```sql
-- column의 순서와 각 열의 모든 값을 알아야 한다.
INSERT INTO movies VALUES (
	'The Godfather',
  1980,
  'The best movie in the world',
  10,
  'F.F.C'
);

-- 특정 컬럼의 값으로 입력
INSERT INTO movies (title) VALUES (
	'해리포터'
);
```

- update & delete
  - condition(WHERE)이 없으면 모든 테이블이 영향 받는다.

```sql
-- Update
UPDATE movies SET rating = rating + 7 WHERE title = '1987';
UPDATE movies SET director = 'Unknwon' WHERE director IS NULL; -- Null은 value가 아니기 때문에

-- Delete
DELETE from movies where id = 1;
```

- select

```sql
SELECT
	REPLACE(title, '1987', '2024') AS title,
  rating * 2 AS double_rating,
  UPPER(overview) AS overview
from movies WHERE id >= 5;
```

```sql
WHERE	genres IN ('Documentary', 'Comedy');
```

- pattern matching

```sql
WHERE title LIKE 'The%'; -- The로 시작하는 영화 title
WHERE genres not LIKE '%Drama%';
WHERE title LIKE '___ing'; -- 6글자중 ing로 끝나는 title
```

- SELECT CASE

```sql
SELECT
		title,
    CASE WHEN rating > 8 THEN
    	'👍'
    WHEN rating < 6 THEN
    	'👎'
    ELSE
    	'👀'
    END AS good_or_bad
FROM
		movies;
```

- ORDER BY

```sql
SELECT	-- 3
		*
FROM	-- 1
		movies
WHERE	-- 2
		director = 'Darren Aronofsky'
ORDER BY -- 4
		rating DESC;
```

- LIMIT & OFFSET

```sql
SELECT -- 3
	*
FROM -- 1
	movies
WHERE -- 2
	rating > 7
ORDER BY -- 4
	revenue DESC
LIMIT -- 6
	5
OFFSET -- 5
	200;
```

- GROUP BY

특정 column으로 정렬 후, 집계(aggregate)

```sql
SELECT -- 4
	director,
  AVG(revenue) AS average_revenue,
  SUM(revenue) AS total_revenue,
  COUNT(director) AS movie_count
FROM -- 1
	movies
WHERE -- 2
	director IS NOT NULL AND
  revenue IS NOT NULL
GROUP BY -- 3
	director
ORDER BY -- 5
	average_revenue DESC;

-- 평균 평점이 가장 높았던 해는?
SELECT
	release_date,
  ROUND(AVG(rating),2) AS average_rating
FROM
	movies
WHERE
	rating IS NOT NULL AND
  release_date IS NOT NULL
GROUP BY
	release_date
ORDER BY average_rating DESC;
```

- HAVING

GROUP BY로 집계한 결과를 다시 필터링 할 수 있다.

```sql
-- 평균 평점이 가장 높았던 해는?
SELECT
	release_date,
  ROUND(AVG(rating),2) AS average_rating
FROM
	movies
WHERE
	rating IS NOT NULL AND
  release_date IS NOT NULL
GROUP BY
	release_date
HAVING average_rating > 6
ORDER BY average_rating DESC;

-- 5개 이상 제작한 감독의 평균 rating?
SELECT
	director,
  ROUND(AVG(rating),2) AS average_rating,
  COUNT(*) AS total_movies
FROM
	movies
WHERE
	director IS NOT NULL AND
  rating IS NOT NULL
GROUP BY
	director
HAVING
	total_movies >= 5
ORDER BY
	average_rating DESC;

```

- Practice

```sql
-- 각 장르에 몇 편의 영화가 있는지?
SELECT
	genres,
	COUNT(*) AS total_movies
FROM
	movies
WHERE
	genres IS NOT NULL
GROUP BY
	genres
ORDER BY
	total_movies DESC;

-- 연도별 개봉한 영화 수
SELECT
	release_date,
	COUNT(*) AS total
FROM
	movies
WHERE
	release_date IS NOT NULL
GROUP BY
	release_date;

-- 평균 상영시간이 가장 높은 TOP 10 YEARS
SELECT
	release_date,
  ROUND(AVG(runtime),1) AS avg_runtime
FROM
	movies
WHERE
	release_date IS NOT NULL AND
	runtime IS NOT NULL
GROUP BY
	release_date
ORDER BY
	avg_runtime DESC
LIMIT 10;

-- 21세기에 개봉한 영화의 평균 평점
SELECT
	release_date,
  ROUND(AVG(rating),2) AS avg_rating
FROM
	movies
WHERE
	release_date >= 2000 AND
	rating IS NOT NULL
GROUP BY
	release_date
ORDER BY
	avg_rating DESC;

-- 평균 상영시간이 가장 긴 감독
SELECT
	director,
  ROUND(AVG(runtime)/60,2) AS avg_runtime
FROM
	movies
WHERE
	director IS NOT NULL AND
  runtime IS NOT NULL
GROUP BY
	director
ORDER BY
	avg_runtime DESC;

-- 다작 감독 상위 5명
SELECT
	director,
  COUNT(*) AS total
FROM
	movies
WHERE
	director IS NOT NULL
GROUP BY
	director
ORDER BY
	total DESC
LIMIT 5;

-- 각 감독의 최고 평점과 최저 평점
SELECT
	director,
  MIN(rating) AS 최저평점,
  MAX(rating) AS 최고평점,
  COUNT(*) AS total
FROM
	movies
WHERE
	director IS NOT NULL AND
	rating IS NOT NULL
GROUP BY
	director
HAVING
	total >= 5;

-- 가장 많은 수익을 낸 감독
SELECT
	director,
  SUM(revenue-budget) AS 수익,
  COUNT(*) AS total
FROM
	movies
WHERE
	director IS NOT NULL AND
  budget IS NOT NULL AND
  revenue IS NOT NULL
GROUP BY
	director
ORDER BY
	수익 DESC;

-- 10년 단위의 평균 상영시간
SELECT
	(release_date/10)*10 AS decade,
  ROUND(AVG(runtime),2) AS avg_runtime,
  COUNT(*) AS total
FROM
	movies
WHERE
	release_date IS NOT NULL AND
  runtime IS NOT NULL
GROUP BY
	decade;

-- 최고 평점과 최저 평점의 차이가 가장 큰 상위 5개 연도
SELECT
	release_date,
  MAX(rating) - MIN(rating) AS diff_rating
FROM
	movies
WHERE
	release_date IS NOT NULL AND
  rating IS NOT NULL
GROUP BY
	release_date
ORDER BY
	diff_rating DESC
LIMIT
	5;

-- 2시간 미만의 영화를 만들어본적 없는 영화 감독
SELECT
	director,
  MIN(runtime) AS short_movie
FROM
	movies
WHERE
	director IS NOT NULL AND
  runtime IS NOT NULL
GROUP BY
	director
HAVING
	short_movie > 120;

-- 평점 8.0이상인 영화의 비율
SELECT
  COUNT(CASE WHEN rating >= 8 THEN 1 END) * 100.0 / COUNT(*) AS ratio
FROM
	movies;

-- 평점이 7점보다 높은 영화가 차지하는 비율이 높은 감독
SELECT
	director,
	COUNT(CASE WHEN rating > 7 THEN 1 END) * 1.0 / COUNT(*) AS ratio,
  COUNT(*) AS total
FROM
	movies
WHERE
	director IS NOT NULL
GROUP BY
	director
HAVING
	total >= 3
ORDER BY
	ratio DESC;

-- runtime으로 분류
SELECT
	CASE WHEN runtime < 90 THEN
  	'Short'
  WHEN runtime BETWEEN 90 AND 120 THEN
  	'Normal'
  ELSE 'Long'
  END AS 상영시간,
  COUNT(*)
FROM
	movies
GROUP BY
	상영시간;

-- 흑자 영화
SELECT
	CASE WHEN revenue >= budget THEN
  '흑자'
  ELSE '적자'
  END AS 손익,
  COUNT(*) AS total
FROM
	movies
WHERE
	budget IS NOT NULL AND
  revenue IS NOT NULL
GROUP BY
	손익

```

- view

쿼리를 데이터베이스에 저장해서 함수처럼 사용할 수 있다.

View라는것을 명시하기 위해 prefix로 `v_`를 사용 (강제는 아님)

```sql
-- 흑자 영화
CREATE VIEW v_flop_or_not AS SELECT
	CASE WHEN revenue >= budget THEN
  '흑자'
  ELSE '적자'
  END AS 손익,
  COUNT(*) AS total
FROM
	movies
WHERE
	budget IS NOT NULL AND
  revenue IS NOT NULL
GROUP BY
	손익;

SELECT * FROM v_flop_or_not;

DROP VIEW v_flop_or_not;
```
