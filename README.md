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

## SubQueries And (Common Table Expressions)CTEs

- independent subquery
  query planner가 알아서 최적화 해준다. 모든 row에 대해서 시행되지 않고, 한 번 실행된다.

```sql
-- 전체 영화중, 평점이나 수익이 평균보다 높은 영화리스트
SELECT
	COUNT(*)
FROM
	movies
WHERE
	rating > ( -- independent subquery (매번 실행되지 않는다) run once
    SELECT
    	AVG(rating)
		FROM
    	movies);
```

- CTE (재사용 목적)
  CTE는 table을 return 하기때문에, 사용하려는 column으로 값을 가져와야 한다. `avg_revenue_cte.avg_revenue`

```sql
-- 전체 영화중, 평점이나 수익이 평균보다 높은 영화리스트
-- CTE
WITH avg_revenue_cte AS (
    SELECT
        AVG(revenue) AS avg_revenue
    FROM
        movies
), avg_rating_cte AS (
		SELECT
        AVG(rating) AS avg_rating
    FROM
        movies
)
SELECT
    title,
    director,
    revenue,
    ROUND(avg_revenue_cte.avg_revenue, 0) AS avg_revenue,
    rating,
    ROUND(avg_rating_cte.avg_rating, 0) AS avg_rating
FROM
    movies,
    avg_revenue_cte,
    avg_rating_cte
WHERE
    revenue > avg_revenue_cte.avg_revenue AND
		rating > avg_rating_cte.avg_rating;
```

- correlated subquery

```sql
-- 같은 해에 개봉된 영화의 평균보다 높은 평점인 영화 리스트

SELECT
	main_movies.title,
  main_movies.director,
  main_movies.rating
FROM
	movies AS main_movies
WHERE
	main_movies.release_date >= '2020' AND
	main_movies.rating > (SELECT
            	AVG(inner_movies.rating)
            FROM
            	movies AS inner_movies
            WHERE
            	inner_movies.release_date = main_movies.release_date); -- 외부값을 참조하고 있다.
```

CTE가 main_movies를 참조하고있다.

sqlite에서만 동작하고 mysql이나 postgresql에서는 동작하지 않음

```sql
-- 같은 해에 개봉된 영화의 평균보다 높은 평점인 영화 리스트
WITH rating_avg_per_year_cte AS (
  SELECT
    AVG(inner_movies.rating) AS rating_avg_per_year
  FROM
    movies AS inner_movies
  WHERE
    inner_movies.release_date = main_movies.release_date
)
SELECT
  main_movies.title,
  main_movies.director,
  main_movies.rating,
  main_movies.release_date,
  (SELECT rating_avg_per_year FROM rating_avg_per_year_cte) AS rating_avg_per_year
FROM
  movies AS main_movies
WHERE
  main_movies.release_date >= '2022' AND
  main_movies.rating > (SELECT rating_avg_per_year FROM rating_avg_per_year_cte);


-- 해당 장르에서 평균 평점보다 높은 영화 리스트
WITH rating_avg_by_genres_cte AS (
  SELECT
    AVG(inner_movies.rating) AS rating_avg_by_genres
  FROM
    movies AS inner_movies
  WHERE
    inner_movies.genres = main_movies.genres
)
SELECT
  main_movies.title,
  main_movies.genres,
  main_movies.rating,
  (SELECT rating_avg_by_genres FROM rating_avg_by_genres_cte) AS rating_avg_by_genres
FROM
  movies AS main_movies
WHERE
  main_movies.release_date >= '2022' AND
  main_movies.rating > (SELECT rating_avg_by_genres FROM rating_avg_by_genres_cte);
```

- practice

```sql
-- 커리어 revenue가 평균보다 높은 감독 리스트

WITH directors_revenus_cte AS (
	SELECT
		director,
		SUM(revenue) AS career_revenue
	FROM
		movies
	WHERE
		director IS NOT NULL
		AND revenue IS NOT NULL
	GROUP BY
		director
),
avg_director_revenu_cte AS (
	SELECT
		AVG(career_revenue)
	FROM
		directors_revenus_cte
)
SELECT
	director,
	SUM(revenue) AS total_revenue,
	(
		SELECT
			*
		FROM
			avg_director_revenu_cte) AS peers_avg
FROM
	movies
WHERE
	director IS NOT NULL
	AND revenue IS NOT NULL
GROUP BY
	director
HAVING
	total_revenue > (
		SELECT
			*
		FROM
			avg_director_revenu_cte);

-- diretor에 대한 다양한 통계

WITH director_stats_cte AS (
	SELECT
		director,
		COUNT(*) AS total_movies,
		AVG(rating) AS avg_rating,
		MAX(rating) AS best_rating,
		MIN(rating) AS worst_rating,
		MAX(budget) AS highest_budget,
		MIN(budget) AS lowest_budget
	FROM
		movies
	WHERE
		director IS NOT NULL
		AND budget IS NOT NULL
		AND rating IS NOT NULL
	GROUP BY
		director
	HAVING
		total_movies > 2 -- 쿼리 시간 제한을 위해
	LIMIT 20
)
SELECT
	director,
	total_movies,
	avg_rating,
	best_rating,
	worst_rating,
	highest_budget,
	lowest_budget,
	(
		SELECT
			title
		FROM
			movies
		WHERE
			rating IS NOT NULL
			AND budget IS NOT NULL
			AND director = ds.director
		ORDER BY
			rating DESC
		LIMIT 1) AS best_rated_movie,
	(
		SELECT
			title
		FROM
			movies
		WHERE
			rating IS NOT NULL
			AND budget IS NOT NULL
			AND director = ds.director
		ORDER BY
			rating ASC
		LIMIT 1) AS worst_rated_movie,
	(
		SELECT
			title
		FROM
			movies
		WHERE
			rating IS NOT NULL
			AND budget IS NOT NULL
			AND director = ds.director
		ORDER BY
			budget DESC
		LIMIT 1) AS most_expensive_movie,
	(
		SELECT
			title
		FROM
			movies
		WHERE
			rating IS NOT NULL
			AND budget IS NOT NULL
			AND director = ds.director
		ORDER BY
			budget ASC
		LIMIT 1) AS least_expensive_movie
FROM
	director_stats_cte AS ds;

```

- indexing

```sql
CREATE INDEX idx_director ON movies (director);
```

## Indexes

table scan → 한 행씩 찾아보는것

query plan

`EXPLAIN query plan`

```sql
-- before index

2	0	0	CO-ROUTINE director_stats_cte
8	2	0	SCAN movies
17	2	0	USE TEMP B-TREE FOR GROUP BY
77	0	0	SCAN ds
88	0	0	CORRELATED SCALAR SUBQUERY 2
97	88	0	SCAN movies
119	88	0	USE TEMP B-TREE FOR ORDER BY
126	0	0	CORRELATED SCALAR SUBQUERY 3
135	126	0	SCAN movies
157	126	0	USE TEMP B-TREE FOR ORDER BY
164	0	0	CORRELATED SCALAR SUBQUERY 4
173	164	0	SCAN movies
194	164	0	USE TEMP B-TREE FOR ORDER BY
201	0	0	CORRELATED SCALAR SUBQUERY 5
210	201	0	SCAN movies
231	201	0	USE TEMP B-TREE FOR ORDER BY

-- after index
2	0	0	CO-ROUTINE director_stats_cte
9	2	0	SEARCH movies USING INDEX idx_director (director>?)
68	0	0	SCAN ds
79	0	0	CORRELATED SCALAR SUBQUERY 2
89	79	0	SEARCH movies USING INDEX idx_director (director=?)
112	79	0	USE TEMP B-TREE FOR ORDER BY
119	0	0	CORRELATED SCALAR SUBQUERY 3
129	119	0	SEARCH movies USING INDEX idx_director (director=?)
152	119	0	USE TEMP B-TREE FOR ORDER BY
159	0	0	CORRELATED SCALAR SUBQUERY 4
169	159	0	SEARCH movies USING INDEX idx_director (director=?)
191	159	0	USE TEMP B-TREE FOR ORDER BY
198	0	0	CORRELATED SCALAR SUBQUERY 5
208	198	0	SEARCH movies USING INDEX idx_director (director=?)
230	198	0	USE TEMP B-TREE FOR ORDER BY
```

## MySQL

도커로 설치 후, mysql workbench와 연결 ([도커문서](https://hub.docker.com/_/mysql))

`docker pull mysql:8`

`docker run --name some-mysql -e MYSQL_ROOT_PASSWORD=my-secret-pw -d mysql:tag`

mysql workbench로 연결

- Data Types

```sql
CREATE TABLE users (
user_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
username CHAR(10) NOT NULL UNIQUE,
email VARCHAR(50) NOT NULL UNIQUE,
gender ENUM('Male', 'Female') NOT NULL,
interests SET('Technology', 'Sports', 'Music', 'Art', 'Travel', 'Food', 'Fashion', 'Science') NOT NULL,
bio TEXT NOT NULL, -- TINYTEXT profile_picture TINYBLOB, -- TINYBLOB, BLOB, MEDIUMBLOB, LONGBLOB
-- TINYINT SIGNED: -128 TO 127 UNSIGNED: 0 TO 255
-- SMALLINT: SIGNED: -32768 TO 32767, UNSIGNED: 0 TO 65535
-- MEDIUMINT SIGNED: -8388608 TO 8388607 UNSIGNED: 0 TO 16777215
-- INT SIGNED: -2147483648 TO 2147483647, UNSIGNED: 0 TO 4294967295
-- BIGINT SIGNED: -9223372036854775808 TO 9223372036854775807, UNSIGNED: 0 TO 18446744073709551615

age TINYINT UNSIGNED NOT NULL CHECK (age < 100),
is_admin BOOLEAN DEFAULT FALSE NOT NULL, -- TINYINT(1, 0)
balance FLOAT DEFAULT 0.0 NOT NULL, -- DECIMAL(p,s)
/* TIMESTAMP - '1970-01-01 00:00:01' UTC to '2038-01-19 03:14:07' UTC
DATETIME - '1000-01-01 00:00:00' to '9999-12-31 23:59:59' */
joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL, -- DATETIME YYYY-MM-DD hh:mm:ss
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
birth_date DATE NOT NULL,
bed_time TIME NOT NULL,
graduation_year YEAR NOT NULL, -- 1901 to 2155
-- We also have JSON, GEOMETRY, POINT, LINESTRING, POLYGON, MULTIPOINT, MULTILINESTRING, MULTIPOLYGON, & GEOMETRYCOLLECTION

CONSTRAINT chk_age CHECK(age < 100),
CONSTRAINT uq_email UNIQUE(email)
);
```

CONSTRAINT는 inline 방식 또는 named 방식이 있다.

named의 경우 `CONSTRAINT uq_profile UNIQUE(username, email)` 과 같이 조합으로 사용할 수 있다.

- Insert

```sql
INSERT INTO users (
username,
email,
gender,
interests,
bio,
age,
is_admin,
birth_date,
bed_time,
graduation_year
) VALUES (
'jw',
'jw@hello.com',
'Male',
'Travel,Music,Technology,Science',
'coding and watch movie',
31,
TRUE,
'1993.01.29',
'00:30',
'2016'
);
```

- ALTER TABLE (BASIC)

```sql
-- Table 상세정보
SHOW CREATE TABLE users;

-- drop column
ALTER TABLE users DROP COLUMN balance;

-- renmae columm: 타입을 명시해야한다
ALTER TABLE users CHANGE COLUMN bio about_me TINYTEXT;

-- change the column type
ALTER TABLE users MODIFY COLUMN about_me TEXT;

-- rename database
ALTER TABLE users RENAME TO customers;
ALTER TABLE customers RENAME TO users;

-- drop constraints
ALTER TABLE users
	DROP CONSTRAINT uq_email,
	DROP CONSTRAINT username,
	DROP CONSTRAINT chk_age;

-- add constraints
ALTER TABLE users
	ADD CONSTRAINT uq_email UNIQUE (email),
	ADD CONSTRAINT uq_username UNIQUE (username);
ALTER TABLE users
	ADD CONSTRAINT chk_age CHECK (age < 100);

-- NOT NULL <-> NULL
ALTER TABLE users MODIFY COLUMN bed_time TIME NULL;
```

- ALTER TABLE (Data Type)

type을 변경하는 경우, 새 컬럼을 생성하고 및 복제 완료 후 기존 컬럼을 drop 시킨다.

```sql

-- 컬럼의 DATA type 변경 1
ALTER TABLE users ADD COLUMN graduation_date DATE;

UPDATE users SET graduation_date = MAKEDATE(graduation_year, 1);

ALTER TABLE users DROP COLUMN graduation_year;

ALTER TABLE users MODIFY COLUMN graduation_date DATE NOT NULL;

-- 컬럼의 DATA type 변경 2
ALTER TABLE users ADD COLUMN
	graduation_date DATE NOT NULL DEFAULT MAKEDATE(graduation_year, 1);

ALTER TABLE users DROP COLUMN graduation_year;
```

- Generated Column
  options: STORED, VIRTUAL

```sql
CREATE TABLE users_v2 (
	user_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
	first_name VARCHAR(50),
	last_name VARCHAR(50),
	email VARCHAR(100),
	full_name VARCHAR(101) GENERATED ALWAYS AS (
CONCAT(first_name, ' ', last_name)) STORED
);

INSERT INTO users_v2 (first_name, last_name, email) VALUES (
	'jinwook',
	'song',
	'jwsong@gmail.com'
);

ALTER TABLE users_v2
	ADD COLUMN email_domain VARCHAR(50) GENERATED ALWAYS AS (
SUBSTRING_INDEX(email, '@', - 1)) virtual; -- 디스크에 저장되지 않고 SELECT 시점에 계산된다.

```
