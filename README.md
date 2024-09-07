# Database

| 프로젝트 기간 | 24.08.23 ~                                                             |
| ------------- | ---------------------------------------------------------------------- |
| 프로젝트 목적 | Study SQL                                                              |
| Github        | https://github.com/Jinwook-Song/db-playground                          |
| docs          |                                                                        |
| data(sqlite)  | https://pub-f13217639d6446309ebabc652f18d0ad.r2.dev/movies_download.db |
| data(json)    | https://pub-f13217639d6446309ebabc652f18d0ad.r2.dev/movies-data.json   |
| data(postgre  | https://pub-f13217639d6446309ebabc652f18d0ad.r2.dev/pg_backup          |

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

```sql
/*
- Columns you use often (WHERE, ORDER BY, JOIN*)
- Columns with many unique values (high cardinality)
- Large tables.
- Foreign keys*
- Don't Over Index (INSERT, UPDATE, DELETE, Storage)
- Add them after you are done, to speed up queries.
- Multi-Column (Composite Indexes) for queries that filter or sort by multiple columns together.
- Covering indexes, if you can and it's cheap.
- Don't index small tables.
- Consider Update frequency
- Large text column? Use a full-text* index rather than a B-tree.
*/
```

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

- B+ tree
- Multi Column Index
  index의 순서도 중요하다. 범위에 대해 query를 요청하면 index에서 앞의 column만 사용된다. → 자주 사용되는 column을 앞에 배치

```sql
CREATE INDEX idx_release_rating ON movies (release_date, rating);

```

- covering index
  multi column index를 사용하는 경우, select에 해당 컬럼이 포함되어있으면 main db로 점프하지 않고도, index만으로 결과를 return 받을 수 있다. (index에서 해당 값을 가지고 있기 때문에 당연한 논리)

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

## Foreign key

- Entity
  하나의 테이블엔 하나의 관심사만 담도록 분리

```sql
CREATE TABLE dogs (
    dog_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    breed_name VARCHAR(50) NOT NULL,
    breed_size_category ENUM('small', 'medium', 'big') DEFAULT 'small',
    breed_typical_lifespan TINYINT,
    date_of_birth DATE,
    weight DECIMAL(5,2),
    owner_name VARCHAR(50) NOT NULL,
    owner_email VARCHAR(100) UNIQUE,
    owner_phone VARCHAR(20),
    owner_address TINYTEXT
);

->

CREATE TABLE dogs (
	dog_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
	name VARCHAR(50) NOT NULL,
	date_of_birth DATE,
	weight DECIMAL (5,2),
	breed_id BIGINT UNSIGNED,
	owner_id BIGINT UNSIGNED
);

CREATE TABLE breeds (
	breed_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
	name VARCHAR(50) NOT NULL,
	size_category ENUM ('small','medium','big') DEFAULT 'small',
	typical_lifespan TINYINT
);

CREATE TABLE owners (
	owner_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
	name VARCHAR(50) NOT NULL,
	email VARCHAR(100) UNIQUE,
	phone VARCHAR(20),
	address TINYTEXT
);
```

- foreign key (constraints)

```sql
CREATE TABLE dogs (
	dog_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
	name VARCHAR(50) NOT NULL,
	date_of_birth DATE,
	weight DECIMAL (5,2),
	breed_id BIGINT UNSIGNED,
	owner_id BIGINT UNSIGNED,
	FOREIGN KEY (breed_id) REFERENCES breeds (breed_id), -- unnamed
	CONSTRAINT owner_fk FOREIGN KEY (owner_id) REFERENCES owners (owner_id) -- named
);
```

- ON DELETE

```sql
CASCADE -- 부모가 삭제되면 관련된 자식 행이 모두 삭제됨
SET NULL -- 이 옵션은 외래 키 컬럼이 NULL을 허용할 수 있을 때만 사용
RESTRICT -- 참조되고 있는 한, 그 행을 삭제할 수 없음
NO ACTION -- RESTRICT와 동일하게 동작
SET DEFAULT -- 컬럼이 기본값을 가질 수 있을 때만 사용 가능
```

- One-to-Many, One-to-One

```sql
CREATE TABLE pet_passports (
	pet_passport_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
	blood_type VARCHAR(5),
	dog_id BIGINT UNSIGNED UNIQUE, -- One-to-One
	FOREIGN KEY (dog_id) REFERENCES dogs (dog_id) ON DELETE CASCADE
);
```

- Many-to-Many
  두 테이블을 연결하는 bridge table을 활용한다.

```sql
CREATE TABLE tricks (
	trick_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
	name VARCHAR(50) NOT NULL,
	difficulty ENUM ('easy', 'medium', 'hard') NOT NULL DEFAULT 'easy'
);

CREATE TABLE dog_tricks (
	dog_id BIGINT UNSIGNED,
	trick_id BIGINT UNSIGNED,
	PRIMARY KEY (dog_id, trick_id),
	FOREIGN KEY (dog_id) REFERENCES dogs (dog_id) ON DELETE CASCADE,
	FOREIGN KEY (trick_id) REFERENCES tricks (trick_id) ON DELETE CASCADE
);
```

## Join

- sample data

```sql
-- Create tables
CREATE TABLE dogs (
    dog_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    weight DECIMAL(5,2),
    date_of_birth DATE,
    owner_id BIGINT UNSIGNED,
    breed_id BIGINT UNSIGNED,
    FOREIGN KEY (owner_id) REFERENCES owners (owner_id) ON DELETE SET NULL,
    CONSTRAINT breed_fk FOREIGN KEY (breed_id) REFERENCES breeds (breed_id) ON DELETE SET NULL
);

CREATE TABLE owners (
    owner_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    address TINYTEXT
);

CREATE TABLE breeds (
    breed_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    size_category ENUM ('small', 'medium', 'big') DEFAULT 'small',
    typical_lifespan TINYINT
);

CREATE TABLE pet_passports (
    pet_passport_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    blood_type VARCHAR(10),
    allergies TEXT,
    last_checkup_date DATE,
    dog_id BIGINT UNSIGNED UNIQUE,
    FOREIGN KEY (dog_id) REFERENCES dogs (dog_id) ON DELETE CASCADE
);

CREATE TABLE tricks (
    trick_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL,
    difficulty ENUM('easy', 'medium', 'hard') NOT NULL DEFAULT 'easy'
);

CREATE TABLE dog_tricks (
    dog_id BIGINT UNSIGNED,
    trick_id BIGINT UNSIGNED,
    proficiency ENUM('beginner', 'intermediate', 'expert') NOT NULL DEFAULT 'beginner',
    date_learned TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (dog_id, trick_id),
    FOREIGN KEY (dog_id) REFERENCES dogs (dog_id) ON DELETE CASCADE,
    FOREIGN KEY (trick_id) REFERENCES tricks (trick_id) ON DELETE CASCADE
);

-- INSERT
INSERT INTO breeds (name, size_category, typical_lifespan) VALUES
('Labrador Retriever', 'big', 12),
('German Shepherd', 'big', 11),
('Golden Retriever', 'big', 11),
('French Bulldog', 'small', 10),
('Beagle', 'medium', 13),
('Poodle', 'medium', 14),
('Chihuahua', 'small', 15);

INSERT INTO owners (name, email, phone, address) VALUES
('John Doe', 'john@example.com', '123-456-7890', '123 Main St, Anytown, USA'), ('Jane Smith', 'jane@example.com', '234-567-8901', '456 Elm St, Someplace, USA'), ('Bob Johnson', 'bob@example.com', '345-678-9012', '789 Oak St, Elsewhere, USA'), ('Alice Brown', 'alice@example.com', '456-789-0123', '321 Pine St, Nowhere, USA'), ('Charlie Davis', 'charlie@example.com', '567-890-1234', '654 Maple St, Somewhere, USA'), ('Eva Wilson', 'eva@example.com', '678-901-2345', '987 Cedar St, Anyville, USA'), ('Frank Miller', 'frank@example.com', '789-012-3456', '246 Birch St, Otherville, USA'), ('Grace Lee', 'grace@example.com', '890-123-4567', '135 Walnut St, Hereville, USA'), ('Henry Taylor', 'henry@example.com', '901-234-5678', '864 Spruce St, Thereville, USA'), ('Ivy Martinez', 'ivy@example.com', '012-345-6789', '753 Ash St, Whereville, USA'), ('Jack Robinson', 'jack@example.com', '123-234-3456', '951 Fir St, Thatville, USA'), ('Kate Anderson', 'kate@example.com', '234-345-4567', '159 Redwood St, Thisville, USA');

INSERT INTO dogs (name, date_of_birth, weight, breed_id, owner_id) VALUES
('Max', '2018-06-15', 30.5, 1, 1),
('Bella', '2019-03-22', 25.0, NULL, 2),
('Charlie', '2017-11-08', 28.7, 2, 3),
('Lucy', '2020-01-30', 8.2, NULL, NULL),
('Cooper', '2019-09-12', 22.3, 5, 5),
('Luna', '2018-07-05', 18.6, 6, 6),
('Buddy', '2016-12-10', 31.2, 1, 7),
('Daisy', '2020-05-18', 6.8, NULL, 8),
('Rocky', '2017-08-25', 29.5, 2, 9),
('Molly', '2019-11-03', 24.8, 3, NULL),
('Bailey', '2018-02-14', 21.5, 5, 11),
('Lola', '2020-03-27', 7.5, 4, 12),
('Duke', '2017-05-09', 32.0, NULL, 1),
('Zoe', '2019-08-11', 17.8, 6, 2),
('Jack', '2018-10-20', 23.6, NULL, 3),
('Sadie', '2020-02-05', 26.3, 3, 4),
('Toby', '2017-07-17', 8.9, 7, NULL),
('Chloe', '2019-04-30', 20.1, 6, 6),
('Bear', '2018-01-08', 33.5, 2, 7),
('Penny', '2020-06-22', 7.2, 4, NULL);

INSERT INTO tricks (name, difficulty) VALUES
('Sit', 'easy'),
('Stay', 'medium'),
('Fetch', 'easy'),
('Roll Over', 'hard'),
('Shake Hands', 'medium');

INSERT INTO dog_tricks (dog_id, trick_id, proficiency, date_learned) VALUES
(1, 1, 'expert', '2019-01-15'),
(1, 2, 'intermediate', '2019-03-20'),
(14, 3, 'expert', '2019-02-10'),
(2, 1, 'expert', '2019-07-05'),
(2, 3, 'intermediate', '2019-08-12'),
(3, 1, 'expert', '2018-03-10'),
(3, 2, 'expert', '2018-05-22'),
(13, 4, 'beginner', '2019-11-30'),
(4, 1, 'intermediate', '2020-05-18'),
(5, 1, 'expert', '2020-01-07'),
(11, 3, 'expert', '2020-02-15'),
(5, 5, 'intermediate', '2020-04-22'),
(7, 1, 'expert', '2017-06-30'),
(7, 2, 'expert', '2017-08-14'),
(12, 3, 'expert', '2017-07-22'),
(16, 4, 'intermediate', '2018-01-05'),
(7, 5, 'expert', '2017-09-18'),
(10, 1, 'intermediate', '2020-03-12'),
(10, 3, 'beginner', '2020-05-01'),
(15, 1, 'expert', '2019-02-28'),
(14, 2, 'intermediate', '2019-04-15'),
(18, 1, 'intermediate', '2019-09-10'),
(18, 5, 'beginner', '2020-01-20');

INSERT INTO pet_passports (dog_id, blood_type, allergies, last_checkup_date) VALUES
(1, 'DEA 1.1+', 'None', '2023-01-05'),
(2, 'DEA 1.1-', 'Chicken', '2023-02-22'),
(3, 'DEA 4+', 'None', '2023-03-08'),
(5, 'DEA 7+', 'Beef', '2023-04-12'),
(7, 'DEA 1.1+', 'None', '2023-01-10'),
(10, 'DEA 3-', 'Dairy', '2023-05-03'),
(12, 'DEA 5-', 'None', '2023-03-27'),
(15, 'DEA 1.1-', 'Grains', '2023-04-20'),
(18, 'DEA 7+', 'None', '2023-04-03'),
(20, 'DEA 4+', 'Pollen', '2023-06-22');,
```

- CROSS JOIN

두 테이블의 모든 행을 서로 조합한 결과를 반환

```sql
SELECT * FROM dogs CROSS JOIN owners;
```

- INNER JOIN (JOIN)

두 테이블에서 공통된 값을 가지는 행들만을 결합하여 반환

두 테이블 간의 **조인 조건**이 반드시 필요하며, 이 조건에 맞는 행들만 결과로 반환

```sql
SELECT
	dogs.name AS dog_name,
	owners.name AS owner_name,
	breeds.*
FROM
	dogs
	JOIN owners ON dogs.owner_id = owners.owner_id
	JOIN breeds USING(breed_id); -- 동일한 컬럼명을 사용하는 경우
```

- OUTER JOIN

테이블 간의 관계를 이해하고, 필요한 데이터를 포함하면서 데이터 누락을 방지

**LEFT JOIN**: 왼쪽 테이블의 모든 행과 오른쪽 테이블의 일치하는 행을 결합하며, 일치하지 않는 경우 오른쪽 테이블의 열을 NULL로 채움

**RIGHT JOIN**: LEFT JOIN의 반대

**FULL OUTER JOIN**: 양쪽 테이블의 모든 행을 결합하며, 일치하지 않는 경우 NULL로 표시합니다. MySQL에서는 이를 지원하지 않으므로 LEFT JOIN과 RIGHT JOIN의 조합 구현

```sql
SELECT
	dogs.name AS dog_name,
	owners.name AS owner_name
FROM
	dogs
	RIGHT JOIN owners ON dogs.owner_id = owners.owner_id;
```

- Practice

```sql
-- List all dogs with there breed name
SELECT
	dogs.*,
	breeds. `name`
FROM
	dogs
	JOIN breeds USING (breed_id);

-- Show all owners and their dogs (if they have any)
SELECT * FROM owners JOIN dogs USING (owner_id);

-- Display all breeds and the dogs of that breeds (if any)
SELECT * FROM breeds JOIN dogs USING (breed_id);

-- List all dogs with their pet passports
-- information and owner data (if available)

SELECT
	d.`name`,
	pp.allergies,
	o.`name`
FROM
	dogs d
	LEFT JOIN pet_passports pp USING (dog_id)
	LEFT JOIN owners o USING (owner_id);

-- show all tricks and the dogs that they know them
SELECT
	tricks.`name`,
	dogs.`name`,
	dog_tricks.proficiency,
	dog_tricks.date_learned
FROM
	tricks
	JOIN dog_tricks ON tricks.trick_id = dog_tricks.trick_id
	JOIN dogs ON dogs.dog_id = dog_tricks.dog_id;

-- Display all dogs that don't know a single tricks
SELECT
	dogs. `name`
FROM
	dogs
	LEFT JOIN dog_tricks USING (dog_id)
WHERE
	dog_tricks.dog_id IS NULL;

-- show all breeds and the count of dogs for each breed
SELECT
	breeds. `name`,
	COUNT(*) dog_count
FROM
	breeds
	RIGHT JOIN dogs USING (breed_id)
GROUP BY
	breeds. `name`;

-- Display all owners with
-- the count of their dogs,
-- the average dog weight and the average dog age.

SELECT
	owners. `name` owner_name,
	COUNT(dogs.owner_id) total_dogs,
	AVG(dogs.weight) avg_weight,
	ROUND(AVG(TIMESTAMPDIFF(YEAR, dogs.date_of_birth, CURDATE())),1) avg_age
FROM
	owners
	LEFT JOIN dogs USING (owner_id)
GROUP BY
	owners.owner_id;

-- Show all tricks and the number
-- of dogs that know each trick
-- ordered by popularity

SELECT
	tricks. `name`,
	COUNT(dog_tricks.dog_id) dog_count
FROM
	tricks
	JOIN dog_tricks USING (trick_id)
GROUP BY
	tricks.trick_id
ORDER BY dog_count DESC;

-- Display all dogs along with the count of tricks they know
SELECT
	dogs. `name`,
	COUNT(*)
FROM
	dogs
	JOIN dog_tricks USING (dog_id)
GROUP BY
	dogs.dog_id;

-- List all owners with their dogs and the tricks their dogs know
SELECT
	o. `name`,
	d.`name`,
	t.`name`,
	dt.proficiency
FROM
	owners o
	JOIN dogs d USING (owner_id)
	JOIN dog_tricks dt USING (dog_id)
	JOIN tricks t USING (trick_id);

-- Show all breeds with their average dog weight and typical lifespan
SELECT
	breeds. `name`,
	AVG(dogs.weight),
	breeds.typical_lifespan
FROM
	breeds
	JOIN dogs USING (breed_id)
GROUP BY
	breeds.breed_id;

-- Display all dogs with their latest checkup date and the time since their last checkup
SELECT
	dogs. `name`,
	pp.last_checkup_date,
	TIMESTAMPDIFF(DAY, pp.last_checkup_date, CURDATE())
FROM
	dogs
	JOIN pet_passports pp USING (dog_id)
GROUP BY
	dogs.dog_id;

-- Display all breeds with the name of the heaviest dog of that breed
SELECT
    breeds.name AS breed_name,
    dogs.name AS dog_name,
    dogs.weight
FROM
    breeds
JOIN
    dogs USING(breed_id)
WHERE
    dogs.weight = (
        SELECT MAX(d.weight)
        FROM dogs d
        WHERE d.breed_id = breeds.breed_id
    );

-- List all tricks with the name of the dog who learned it most recently
SELECT
	tricks. `name`,
	dogs. `name`,
	dog_tricks.date_learned
FROM
	tricks
	JOIN dog_tricks USING (trick_id)
	JOIN dogs USING (dog_id)
WHERE
	dog_tricks.date_learned = (
		SELECT
			MAX(dog_tricks.date_learned)
		FROM
			dog_tricks
		WHERE
			dog_tricks.trick_id = tricks.trick_id);

```

## Normalization

- Normalizing `status`

  1. statuses 컬럼 생성
  2. 각 status row 생성
  3. movies 테이블에 status_id 컬럼 생성
  4. foreign key 연결
  5. movies 테이블의 status에 따라 status_id 업데이트
  6. movies 테이블의 status 컬럼 삭제

  ```sql
  CREATE TABLE statuses (
  	status_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  	status_name ENUM (
  		'Canceled',
  		'In Production',
  		'Planned',
  		'Post Production',
  		'Released',
  		'Rumored') NOT NULL,
  	explanation TEXT,
  	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
  );

  insert INTO statuses (status_name) SELECT status from movies GROUP BY status;

  ALTER TABLE movies ADD COLUMN status_id BIGINT UNSIGNED;

  ALTER TABLE movies
  	ADD CONSTRAINT fk_status FOREIGN KEY (status_id) REFERENCES statuses (status_id) ON DELETE SET NULL;

  UPDATE
  	movies
  SET
  	status_id = (
  		SELECT
  			status_id
  		FROM
  			statuses
  		WHERE
  			statuses.status_name = movies.status);

  ALTER TABLE movies DROP COLUMN status;
  ```

- Normalizing `director`
  director 수가 많기 때문에, movie table을 업데이트 하기전에 indexing을 한다
  미리 indexing을 하는것이 아닌 필요할때, 추가한다
  `CREATE INDEX idx_director_name ON directors (name);`

  ```sql
  CREATE TABLE directors (
  	director_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  	name VARCHAR(120),
  	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
  );

  INSERT INTO directors (name)
  SELECT
  	director
  FROM
  	movies
  GROUP BY
  	director
  HAVING
  	director <> '';

  ALTER TABLE movies ADD COLUMN director_id BIGINT UNSIGNED;

  ALTER TABLE movies
  	ADD CONSTRAINT fk_director FOREIGN KEY (director_id) REFERENCES directors (director_id) ON DELETE SET NULL;

  CREATE INDEX idx_director_name ON directors (name);

  UPDATE
  	movies
  SET
  	director_id = (
  		SELECT
  			director_id
  		FROM
  			directors
  		WHERE
  			directors.name = movies.director);

  ALTER TABLE movies DROP COLUMN director;
  ```

- Normalizing `original_language`

  ```sql
  CREATE TABLE langs (
  	lang_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  	name VARCHAR(120),
  	code CHAR(2),
  	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
  );

  INSERT INTO langs (code)
  SELECT
  	original_language
  FROM
  	movies
  GROUP BY
  	original_language;

  ALTER TABLE movies ADD COLUMN original_lang_id BIGINT UNSIGNED;

  ALTER TABLE movies
  	ADD CONSTRAINT fk_original_lang FOREIGN KEY (original_lang_id) REFERENCES langs (lang_id) ON DELETE SET NULL;

  UPDATE
  	movies
  SET
  	original_lang_id = (
  		SELECT
  			lang_id
  		FROM
  			langs
  		WHERE
  			langs.code = movies.original_language);

  ALTER TABLE movies DROP COLUMN original_language;
  ```

- Normalizing `country` (many to many)

  - union
    행을 결합 (Join이 horizontal 결합이라면, Union은 vertical 결합)

  ```sql
  -- Comma 1개
  SELECT
  	SUBSTRING_INDEX(country, ',', 1)
  FROM
  	movies
  WHERE
  	country LIKE '__,__'
  GROUP BY
  	country
  UNION
  SELECT
  	SUBSTRING_INDEX(country, ',', - 1)
  FROM
  	movies
  WHERE
  	country LIKE '__,__'
  GROUP BY
  	country;

  -- Commna 2개
  INSERT IGNORE INTO countries (country_code)
  SELECT
  	SUBSTRING_INDEX(country, ',', 1)
  FROM
  	movies
  WHERE
  	country LIKE '__,__,__'
  GROUP BY
  	country
  UNION
  SELECT
  	SUBSTRING_INDEX(country, ',', -1)
  FROM
  	movies
  WHERE
  	country LIKE '__,__,__'
  GROUP BY
  	country
  UNION
  SELECT
  	SUBSTRING_INDEX(SUBSTRING_INDEX(country, ',', 2), ',', -1)
  FROM
  	movies
  WHERE
  	country LIKE '__,__,__'
  GROUP BY
  	country;

  ```

  - ignore
    오류를 발생시키지 않고 해당 행을 무시

  ```sql
  INSERT IGNORE INTO countries (country_code)
  SELECT
  	SUBSTRING_INDEX(country, ',', 1)
  FROM
  	movies
  WHERE
  	country LIKE '__,__'
  GROUP BY
  	country
  UNION
  SELECT
  	SUBSTRING_INDEX(country, ',', - 1)
  FROM
  	movies
  WHERE
  	country LIKE '__,__'
  GROUP BY
  	country;
  ```

  - movies_countries column으로 연결

  ```sql
  INSERT INTO movies_countries (movie_id, country_id)
  SELECT
  	movies.movie_id,
  	countries.country_id
  FROM
  	movies
  	JOIN countries ON movies.country LIKE CONCAT('%', countries.country_code, '%')
  WHERE
  	movies.country <> '';
  ```

## Events & Triggers

기존 테이블 구조와 동일한 테이블 생성

`CREATE TABLE archived_movies LIKE movies;`

[CHAT-GPT](https://chatgpt.com/share/d5844020-c1d8-46d9-a363-879f3421750f)

- event: cron과 유사하다. mysql에서만 사용가능

**DELIMITER $$**: MySQL의 기본 명령문 종료 구분자인 ; 대신 $$를 사용하여 여러 명령문을 포함하는 이벤트 블록을 정의, 이벤트 블록이 끝난 후, 다시 기본 구분자인 ;로 변경

이외에도 ON COMPLETION 등으로 이벤트를 특정 시점에 DROP 할 수 있다.

```sql
CREATE TABLE archived_movies LIKE movies;

-- clear table
TRUNCATE TABLE archived_movies;

DROP EVENT archive_old_movies;

DELIMITER $$
CREATE EVENT archive_old_movies
ON SCHEDULE EVERY 1 MINUTE
STARTS CURRENT_TIMESTAMP + INTERVAL 2 MINUTE
DO
BEGIN -- 두 개 이상의 명령을 실행하는 경우
	INSERT INTO archived_movies
	SELECT * FROM movies
	WHERE release_date < YEAR(CURDATE()) - 20;

	DELETE FROM movies WHERE release_date < YEAR(CURDATE()) - 20;
END$$
DELIMITER ;
```

- Triggers

데이터를 조작할때 trigger를 사용(Before, After), 사용가능. 직관적이다

OLD, NEW를 통해 변경 전, 변경 후의 데이터를 알 수 있다.

```sql
-- BEFORE: INSERT, UPDATE, DELETE.
-- AFTER: INSERT, UPDATE, DELETE.

CREATE TABLE records (
	record_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
	changes tinytext,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TRIGGER before_movie_insert
	BEFORE INSERT ON movies
	FOR EACH ROW INSERT INTO records (changes)
		VALUES(CONCAT('will insert: ', NEW.title)
);

CREATE TRIGGER after_movie_insert
	AFTER INSERT ON movies
	FOR EACH ROW INSERT INTO records (changes)
		VALUES(CONCAT('insert completed: ', NEW.title)
);
```

```sql
DELIMITER $$
CREATE TRIGGER after_movie_update
AFTER UPDATE
ON movies
FOR EACH ROW
BEGIN
	DECLARE changes TINYTEXT DEFAULT '';

	IF NEW.title <> OLD.title THEN
		SET changes = CONCAT('Title changed: ', OLD.title, '->', NEW.title, '\n');
	END IF;

	IF NEW.budget <> OLD.budget THEN
		SET changes = CONCAT(changes, 'Budget changed: ', OLD.budget, '->', NEW.budget);
	END IF;

	INSERT INTO records (changes) VALUES (changes);
END$$
DELIMITER ;
```

## FullText indexes

```sql
CREATE fulltext INDEX idx_overview on movies (overview);
```

- natural language mode: MySQL이 텍스트 내에서 가장 관련성이 높은 결과를 자동으로 찾아 반환

```sql

SELECT
	title,
	overview,
	MATCH(overview) AGAINST ('The food') as score
FROM
	movies
WHERE
	MATCH(overview) AGAINST ('The food');

```

- [boolean mode](https://dev.mysql.com/doc/refman/8.4/en/fulltext-boolean.html): 더 복잡한 쿼리를 작성할 수 있게 하며, 특정 단어를 반드시 포함하거나 제외
  ```sql
  	•	+: 반드시 포함되어야 하는 단어를 지정.
  	•	-: 포함되지 않아야 하는 단어를 지정.
  	•	>, <: 단어의 중요도를 높이거나 낮춥니다.
  	•	*: 단어의 일부 일치(와일드카드).
  	•	"": 정확한 문구 검색.
  	•	~: 단어의 중요도를 부정.
  	•	(): 조건 그룹화.
  ```

```sql
SELECT
	title,
	overview,
	MATCH(overview) AGAINST ('+revenge >king -violence' IN BOOLEAN MODE) as score
FROM
	movies
WHERE
	MATCH(overview) AGAINST ('+revenge >king -violence' IN BOOLEAN MODE);
```

- [query expansion](https://dev.mysql.com/doc/refman/8.4/en/fulltext-query-expansion.html): 사용자가 입력한 검색어에 대해 자동으로 연관된 단어나 문구를 추가하여 검색 결과를 확장

```sql
SELECT
	title,
	overview,
	MATCH(overview) AGAINST ('kimchi' WITH QUERY EXPANSION) as score
FROM
	movies
WHERE
	MATCH(overview) AGAINST ('kimchi' WITH QUERY EXPANSION);
```

## PostgresQL

- docker 설치 및 실행

```sql
docker pull postgres
docker run -d --name postgres-db -e POSTGRES_PASSWORD=123 -e TZ=Asia/Seoul -p 5432:5432 postgres
docker exec -it postgres-db /bin/bash
psql -U postgres # 기본 계정
pgAdmin4 연결
```

- Data type

이외에도 point, network address 등의 type이 있다. 해당 목적에 맞는 타입을 사용하면 postgres natvie 기능을 사용하기 좋다

```sql
CREATE TYPE gender_type AS ENUM ('male', 'female');

CREATE TABLE users (

	-- 0 < char(n) varchar(n) < 10,485,760
	username CHAR(10) NOT NULL UNIQUE,
	email VARCHAR(50) NOT NULL UNIQUE,

	gender gender_type NOT NULL,

	interests TEXT[] NOT NULL,

	-- 1 GB
	-- > 2KB TOAST (the oversized-attribute storage technique)
	bio TEXT,

	profile_photo BYTEA,


	-- SMALLINT
	-- Signed:	-32,768 to 32,767

	-- INTEGER
	-- Signed: -2,147,483,648 to 2,147,483,647

	-- BIGINT
	-- Signed: -9,223,372,036,854,775,808 to 9,223,372,036,854,775,807

	-- Unsigned 지원하지 않음 (check constraint로 제한)

	-- SMALLSERIAL (1 to 32767)
	-- SERIAL (1 to 2147483647)
	-- BIGSERIAL (1 to 9223372036854775807

	age SMALLINT NOT NULL CHECK (age >= 0),

	is_admin BOOLEAN NOT NULL DEFAULT FALSE,

	-- 4713 BC to 294276 AD
	joined_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,

	-- on update가 없기 때문에, trigger를 사용해야 한다.
	updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,

	birth_date DATE NOT NULL,

	bed_time TIME NOT NULL,

	gradutaion_year INTEGER NOT NULL CHECK (gradutaion_year BETWEEN 1901 AND 2200),

	intership_period INTERVAL
);
```

- Type casting (::)

```sql
SELECT
	joined_at::date as joined_date,
	EXTRACT(YEAR FROM joined_at) as joined_year,
	joined_at - INTERVAL '1 day' as day_before_joining,
	AGE(birth_date) as age,
	justify_interval(INTERVAL '312312 hour')
FROM
	users;
```

- Indexing Genres with UNNEST, DISTINCT

배열과 같은 복합 데이터 구조를 단일 열의 여러 행으로 풀어내어 작업할 수 있도록

```sql
CREATE TABLE genres (
	genre_id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
	name VARCHAR(50) UNIQUE,
	created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

INSERT INTO genres (name) SELECT DISTINCT
	UNNEST(string_to_array(genres, ','))
FROM
	movies
GROUP BY
	genres;

CREATE TABLE movies_genres (
	movie_id BIGINT,
	genre_id BIGINT,
	created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,

	PRIMARY KEY (movie_id, genre_id),
	FOREIGN KEY (movie_id) REFERENCES movies (movie_id),
	FOREIGN KEY (genre_id) REFERENCES genres (genre_id)
);

INSERT INTO movies_genres (movie_id, genre_id)
SELECT
	movies.movie_id,
	genres.genre_id
FROM
	movies
	JOIN genres ON movies.genres LIKE '%' || genres. "name" || '%';

ALTER TABLE movies DROP COLUMN genres;
```

left, right의 조합 (mysql에서는 미지원)

```sql
SELECT
	movies.title,
	directors. "name"
FROM
	movies
	FULL JOIN directors USING (director_id);
```

## Functions and Procedures

- function

  - return을 해야한다
  - 인자가 있는것과 없는것을 다른 함수로 구분
  - 인자를 named 또는 positional 인자가 가능하다.

  ```sql
  CREATE OR REPLACE FUNCTION hello_world()
  RETURNS text AS $$
  	SELECT 'hello postgres';
  $$
  LANGUAGE SQL;

  CREATE OR REPLACE FUNCTION hello_world(user_name text)
  RETURNS text AS $$
  	SELECT 'hello ' || user_name;
  $$
  LANGUAGE SQL;

  CREATE OR REPLACE FUNCTION hello_world(text, text)
  RETURNS text AS $$
  	SELECT 'hello ' || $1 || ' and ' || $2;
  $$
  LANGUAGE SQL;
  ```

  - return types
    - table을 return 할 수 있다

  ```sql
  CREATE OR REPLACE FUNCTION is_hit_or_flop(movie movies)
  RETURNS TEXT AS
  $$
  	SELECT CASE
  		WHEN movie.revenue > movie.budget THEN 'Hit'
  		WHEN movie.revenue < movie.budget THEN 'Flop'
  		ELSE 'N/A'
  	END
  $$
  LANGUAGE SQL;

  SELECT
  	title,
  	is_hit_or_flop(movies.*)
  FROM
  	movies;

  --

  CREATE OR REPLACE FUNCTION is_hit_or_flop(movie movies)
  RETURNS TABLE (hit_or_flop text, movie_id NUMERIC) AS
  $$
  	SELECT CASE
  		WHEN movie.revenue > movie.budget THEN 'Hit'
  		WHEN movie.revenue < movie.budget THEN 'Flop'
  		ELSE 'N/A'
  	END, movie.movie_id;
  $$
  LANGUAGE SQL;

  SELECT
  	title,
  	(is_hit_or_flop(movies.*)).* -- table의 colulmn을 풀어줌
  FROM
  	movies;
  ```

- [function volatility](https://www.postgresql.org/docs/current/xfunc-volatility.html)

  - VOLATILE - 함수가 외부 요인에 따라 결과가 달라질 수 있으며, PostgreSQL은 매번 이 함수를 실행합니다. 이 속성은 기본 값이며, 함수가 트랜잭션 상태에 의존하거나, 데이터를 삽입, 삭제, 수정하는 경우 사용
  - STABLE - 동일한 쿼리 내에서는 결과가 변하지 않지만, 외부 상태(예: 테이블 데이터 변경)에 영향을 받을 수 있는 상황
  - IMMUTABLE - 항상 같은 input → 같은 output

- Trigger

함수에서 trigger를 return 할 수 있다. postgresql에서 on update를 지원하지 않기 때문에 이런방식으로 updated_at을 적용할 수 있다.

```sql
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS
$$
	BEGIN
		NEW.updated_at = CURRENT_TIMESTAMP;
		RETURN NEW;
	END;
$$
LANGUAGE plpgsql;

CREATE TRIGGER updated_at
BEFORE UPDATE ON movies
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
```

- procedure

  - return 하지 않아도 된다

  ```sql
  CREATE OR REPLACE PROCEDURE hello_world(IN name TEXT, OUT greeting TEXT) AS
  $$
  	BEGIN
  		greeting = 'hello ' || name;
  	END;
  $$
  LANGUAGE plpgsql;

  CALL hello_world('jinwook', NULL);

  ---
  CREATE OR REPLACE PROCEDURE hello_world_i(IN name TEXT,IN lang TEXT,  OUT greeting TEXT) AS
  $$
  DECLARE
  	spanish_hello TEXT := 'hola';
  	italian_hello TEXT := 'ciao';
  	korean_hello TEXT := '안녕';

  BEGIN
  	IF lang = 'korean' THEN
  		greeting := korean_hello || ' ' || name;
  	ELSIF lang = 'italian' THEN
  		greeting := italian_hello || ' ' || name;
  	ELSIF lang = 'spanish' THEN
  		greeting := spanish_hello || ' ' || name;
  	ELSE
  		greeting := 'hello ' || name;
  	END IF;
  END;
  $$
  LANGUAGE plpgsql;

  CALL hello_world_i('jw', 'spanish', NULL);
  ```

- python extension

  - install

  ```sql
  apt-get update
  apt-get install postgresql-plpython3-<Postgres 버전>

  psql -U <username> -d <database_name>

  CREATE EXTENSION plpython3u;
  ```

  - example
    python 문법을 따라야 하며, 소문자로 return 해야한다

  ```sql
  CREATE FUNCTION hello_world_py(name TEXT)
  RETURNS TEXT AS
  $$
  	def hello(name):
  		return f'hello {name}'
  	return hello(name)
  $$ LANGUAGE plpython3u;

  SELECT hello_world_py('jw');
  ```

  - [Trigger, Transition Data(TD)](https://www.postgresql.org/docs/current/plpython-trigger.html)

  ```sql
  CREATE OR REPLACE FUNCTION log_user_changes_to_server()
  RETURNS trigger AS $$
      import json
      import requests

      # 서버로 보낼 기본 URL (로그 서버)
      log_server_url = "https://your-log-server.com/api/logs"

      # 트리거 작업 유형에 따라 로그 데이터 구성
      if TG_OP == 'UPDATE':
          log_data = {
              "operation": "UPDATE",
              "old_name": OLD['name'],
              "new_name": NEW['name'],
              "old_email": OLD['email'],
              "new_email": NEW['email'],
          }

      elif TG_OP == 'INSERT':
          log_data = {
              "operation": "INSERT",
              "new_name": NEW['name'],
              "new_email": NEW['email'],
          }

      # 로그 데이터를 JSON 형식으로 변환
      json_data = json.dumps(log_data)

      # 서버로 POST 요청 보내기
      try:
          response = requests.post(log_server_url, data=json_data, headers={"Content-Type": "application/json"})

          if response.status_code != 200:
              plpy.error(f"Failed to send log to server: {response.status_code}, {response.text}")

      except Exception as e:
          plpy.error(f"Exception occurred while sending log: {str(e)}")

      return NEW
  $$ LANGUAGE plpython3u;
  ```

## Transactions

- 여러 작업을 묶어서 처리할 때, 그 작업들이 모두 성공하거나 모두 실패하게 만들어 데이터의 일관성을 유지

**BEGIN**: 트랜잭션을 시작

**COMMIT**: 트랜잭션이 성공적으로 완료되었을 때, 모든 변경 사항을 데이터베이스에 저장

**ROLLBACK**: 트랜잭션 중간에 오류가 발생했을 때, 트랜잭션 시작 시점으로 돌아가 모든 변경 사항을 취소

```sql
CREATE TABLE accounts (
	account_id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
	account_holder VARCHAR(100) NOT NULL,
	balance DECIMAL (10, 2) NOT NULL
);

ALTER TABLE accounts ADD CONSTRAINT chk_balance CHECK (balance > 0);

INSERT INTO accounts (account_holder, balance)
		VALUES('jw', 2000.00), ('nico', 1000.00);

SELECT * from accounts;

BEGIN;
	SELECT * FROM accounts;

	UPDATE
		accounts
	SET
		balance = balance + 5000
	WHERE
		account_holder = 'jw';

	UPDATE
		accounts
	SET
		balance = balance - 5000
	WHERE
		account_holder = 'nico';
COMMIT;

```

- ACID
  - Atomicity (원자성): **모두 성공하거나** 또는 **아무 작업도 수행되지 않은 상태로 남는** 것을 보장
  - Consistency (일관성): 데이터베이스는 무결성 제약 조건을 만족하는 상태로 유지
  - [Isolation](https://www.postgresql.org/docs/current/transaction-iso.html) (격리성): 여러 트랜잭션이 동시에 실행될 때, 각각의 트랜잭션이 다른 트랜잭션의 영향을 받지 않고 독립적으로 실행되는 것을 보장
    - **Read Uncommitted**: 다른 트랜잭션의 커밋되지 않은 데이터를 읽을 수 있음 (가장 낮은 격리 수준).
    - **Read Committed**: 다른 트랜잭션의 커밋된 데이터만 읽을 수 있음.
    - **Repeatable Read**: 트랜잭션 동안 같은 데이터를 여러 번 읽어도 동일한 결과를 보장
    - **Serializable**: 트랜잭션 간의 완전한 격리를 보장하여, 동시에 실행되는 트랜잭션들이 순차적으로 실행된 것과 같은 결과를 보장함 (가장 높은 격리 수준).
  - Durability (내구성): 내구성은 트랜잭션이 성공적으로 커밋된 후에는 시스템 오류나 장애가 발생하더라도 트랜잭션의 결과가 **영구적으로 저장**된다는 것을 보장
- SAVEPOINT

```sql
BEGIN;
	UPDATE
		accounts
	SET
		balance = balance + 5000
	WHERE
		account_holder = 'jw';

	SAVEPOINT transfer_one;

	SELECT * FROM accounts;

	UPDATE
		accounts
	SET
		balance = balance - 5000
	WHERE
		account_holder = 'nico';

	ROLLBACK TO SAVEPOINT transfer_one; -- transfer_one 이후의 변경 사항 폐기

	ROLLBACK; -- 모든 변경 사항 폐기
COMMIT;

```

- Shared lock (for share)

데이터베이스에서 **동시에 여러 트랜잭션이 데이터를 읽을 수 있도록 허용 (read only)**

```sql
-- Transaction A
BEGIN;

-- 특정 행에 대해 공유 락 설정
SELECT * FROM accounts WHERE account_holder = 'alice' FOR SHARE;

-- 트랜잭션 A는 이 데이터를 읽을 수 있음
-- 트랜잭션 B가 배타적 락을 요청하면 대기하게 됨

COMMIT;

-- Transaction B
BEGIN;

-- 이 트랜잭션은 해당 데이터의 수정이 필요하여 배타적 락을 요청함
UPDATE accounts SET balance = balance + 500 WHERE account_holder = 'alice';

-- 트랜잭션 A가 공유 락을 해제할 때까지 대기

COMMIT;

--	1.	트랜잭션 A는 FOR SHARE를 사용하여 'alice'의 accounts 행에 대해 공유 락을 설정합니다. 이때, 트랜잭션 A는 데이터를 읽을 수 있지만 수정은 할 수 없습니다.
--	2.	트랜잭션 B는 같은 행을 수정하려고 하지만, 배타적 락을 요청하므로 트랜잭션 A의 공유 락이 해제될 때까지 대기합니다.
--	3.	트랜잭션 A가 커밋하거나 롤백하여 공유 락을 해제하면, 트랜잭션 B가 수정 작업을 수행할 수 있습니다.
```

- Exclusive lock (for update)

**하나의 트랜잭션만이 데이터를 수정할 수 있도록** 배타적 잠금을 설정하여 다른 트랜잭션의 읽기/쓰기를 차단

## Data Control Langugae (DCL)

- Users

```sql
-- 새로운 사용자 정의
CREATE ROLE marketer WITH login PASSWORD 'marketer';

-- (SELECT) 권한 부여
GRANT SELECT ON movies TO marketer;

-- 테이블에 설정된 권한 확인
SELECT grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_name = 'movies';

-- 권한 철회
REVOKE SELECT, INSERT ON movies FROM marketer;

-- 모든 테이블에 대한 SELECT 권한 부여
GRANT SELECT ON ALL TABLES IN SCHEMA PUBLIC TO marketer;
```

- [Roles](https://www.postgresql.org/docs/current/sql-createrole.html)
  role을 정의하고 유저에게 role을 부여할 수 있다.

```sql
CREATE ROLE editor;

GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA PUBLIC to editor;

CREATE USER editor_one WITH PASSWORD 'editor_one';

GRANT editor TO editor_one;

REVOKE ALL on movies FROM editor;

-- 특정 column에 대한 권한
GRANT SELECT (title) ON movies TO editor;

-- 동시에 열 수 있는 연결 수 제한
ALTER ROLE editor_one WITH CONNECTION LIMIT 1;

```

## [Json, Jsonb](https://www.postgresql.org/docs/9.5/functions-json.html)

json_build_object, json_build_array

```sql
CREATE TABLE users (
	user_id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
	profile json
);

INSERT INTO users (profile)
		VALUES
	(json_build_object('name', 'Taco', 'age', 30, 'city', 'seoul')),
	(json_build_object('name', 'Giga', 'age', 28, 'city', 'paris', 'hobbies', json_build_array('reading', 'coding')));

SELECT * FROM users;
```

->>는 **텍스트 값**으로 반환하고, ->는 **JSON 객체** 그대로 반환

- querying

```sql
SELECT
    profile ->> 'name' AS name,  -- profile JSON에서 'name' 값을 텍스트로 추출
    profile -> 'age' AS age      -- profile JSON에서 'age' 값을 JSON 객체로 추출
FROM
    users
WHERE
    profile::jsonb ? 'hobbies';  -- profile JSON을 JSONB로 변환 후 'hobbies' 키 존재 여부 확인
```

```sql
SELECT
	profile ->> 'name' name,
	profile -> 'age' age,
	jsonb_array_length(profile -> 'hobbies')
FROM
	users
WHERE
-- 	profile ->> 'name' = 'Taco' AND
	(profile ->> 'age')::INTEGER < 50 AND
	profile -> 'hobbies' ?| array['reading', 'traveling'];

```

- processing

json 데이터의 특정 key의 값을 수정할 수 있다.

```sql
UPDATE users
SET profile = profile || jsonb_build_object('email', 'x@xx.com');

UPDATE users
SET profile = profile - 'email'
WHERE profile ->> 'name' = 'Giga';

UPDATE
	users
SET
	profile = profile || jsonb_set(profile, '{hobbies}', (profile -> 'hobbies') - 'reading');

UPDATE
	users
SET
	profile = profile || jsonb_set(profile, '{hobbies}', (profile -> 'hobbies') || jsonb_build_array('cooking'));

```

## [Postgresql extensions](https://www.postgresql.org/docs/current/contrib.html)

`SELECT * from pg_available_extensions;`

`SELECT * from pg_extension;`

- [HSTORE](https://www.postgresql.org/docs/current/hstore.html)
  key, value의 데이터
  `CREATE EXTENSION hstore;`

  ```sql
  CREATE TABLE users (
  	user_id BIGINT PRIMARY KEY GENERATED ALWAYS as IDENTITY,
  	prefs HSTORE
  );

  INSERT INTO users (prefs) VALUES
  ('theme => dark, lang => kr, notifications => off'),
  ('theme => light, lang => es, notifications => on, push_notifications => on, email_notifications => off'),
  ('theme => dark, lang => it, start_page => dashboard, font_size => large');

  SELECT
  	user_id,
  	prefs -> 'theme',
  	prefs -> ARRAY['lang', 'notifications'],
  	prefs ? 'font_size' as has_fontt_size,
  	prefs ?| ARRAY['push_notifications', 'start_page'],
  	akeys(prefs),
  	avals(prefs),
  	each(prefs)
  FROM
  	users;

  UPDATE users SET prefs['theme'] = 'light' WHERE user_id = 2;

  UPDATE users SET
  	prefs = prefs || hstore(
  		ARRAY['currency', 'cookies_ok'],
  		ARRAY['krw', 'ok']
  		);

  UPDATE users SET
  	prefs = DELETE(prefs, 'cookies_ok');
  ```

- [pgcrypto](https://www.postgresql.org/docs/current/pgcrypto.html)
  `CREATE EXTENSION pgcrypto;`
  저장시에 salt도 함께 저장되기때문에 비교할때 salt를 따로 넣어줄 필요 없다.
  따라서 매번 salt를 랜덤하게 지정해도 괜찮다

  ```sql
  CREATE TABLE users (
  	user_id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  	username VARCHAR(100),
  	password VARCHAR(100)
  );

  INSERT INTO users (username, PASSWORD)
  		VALUES('jw', crypt('1234', gen_salt('bf')));

  SELECT username from users WHERE password = crypt('1234', password);

  SELECT crypt('my_password', gen_salt('bf'));

  ```

- [uuid-ossp](https://www.postgresql.org/docs/current/uuid-ossp.html)
  `CREATE EXTENSION "uuid-ossp";`

  ```sql
  CREATE TABLE users (
  	user_id UUID PRIMARY KEY DEFAULT(uuid_generate_v4()),
  	username VARCHAR(100),
  	password VARCHAR(100)
  );

  INSERT INTO users (username, password) VALUES
  ('jw', '1234');

  SELECT * FROM users;
  ```

## MongoDB

- install

```bash
docker pull mongo
docker run -d -p 27017:27017 --name mongodb mongo
docker exec -it mongodb bash
mongosh

# GUI Tool
brew install --cask mongodb-compass
```

- 기본 명령어

```bash
show dbs # db 목록
use movies # 데이터베이스 선택(없으면 새로 생성됨)

show collections # db에 있는 collection 목록
db.createCollection('movies') # 컬렉션 생성

db.movies.insertOne({ field1: "value1", field2: "value2" })
db.movies.insertMany([{ name: "Jane", age: 25 }, { name: "Bob", age: 40 }])
```

- [query](https://www.mongodb.com/ko-kr/docs/manual/reference/operator/query/)

```bash
db.movies.find().sort({rating:-1, title: 1}).limit(10).skip(10)

# genres의 수가 3보다 작은 영화에 Other, Happy 추가하기
db.movies.updateMany(
{ $expr: { $lt: [{$size: "$genres"}, 3]}},
{ $addToSet: { genres: { $each: ["Other", "Happy"]}}}
)
```

- [aggregate](https://www.mongodb.com/ko-kr/docs/manual/aggregation/)

SQL의 GROUP BY나 JOIN, HAVING과 같은 기능을 대체하는 방법으로, 여러 스테이지로 나뉘어 처리됩니다. 각 스테이지는 특정한 작업을 수행하며, 각 스테이지의 출력이 다음 스테이지의 입력

```bash
db.collection_name.aggregate([
  { <stage1> },
  { <stage2> },
  ...
  { <stageN> }
])

#	1.	특정 날짜 이후의 판매만 선택 ($match).
#	2.	상품별로 그룹화하고 총 판매량을 계산 ($group).
#	3.	판매량이 많은 순서대로 정렬 ($sort).
#	4.	상위 5개의 결과만 반환 ($limit).
db.sales.aggregate([
  { $match: { date: { $gte: new ISODate("2023-01-01") } } },
  { $group: { _id: "$product", totalSales: { $sum: "$amount" } } },
  { $sort: { totalSales: -1 } },
  { $limit: 5 }
])

# 평균 평점
db.movies.aggregate([
  {$group: {_id: null, avgRating: {$avg: "$rating"}}}
])

# unwind(UNNEST), genre로 집계하고 내림차순
db.movies.aggregate([
  {$unwind: "$genres"},
  {$group:
  	{_id: "$genres",
		count: {$sum: 1}},
	},
  {$sort: {count: -1}}
])

db.movies.aggregate([
  {$group: {
		_id: null,
		oldestMovie: {$min: "$year"},
		newestMovie: {$max: "$year"}
	}}
])

# 연도별 평균 runtime
db.movies.aggregate([
  {$group: {
		_id: "$year",
		avg: {$avg: "$runtime"}
	}},
  {$sort: {_id: -1}}
])

# 감독별 다작 순위
db.movies.aggregate([
  {$match: {director: {$exists: true}}},
  {$group: {
		_id: "$director",
		movieCount: {$sum: 1}
	}},
  {$sort: {movieCount: -1}}
])

# 배우별 영화 출연 순위
db.movies.aggregate([
  {$unwind: "$cast"},
  {$group: {
		_id: "$cast",
		movieCount: {$sum: 1}
	}},
  {$sort: {movieCount: -1}}
])

# title, cast만 표기
db.movies.aggregate([
  {$project:
    {title: 1, cast: 1, _id: 0}
	}
])
```
