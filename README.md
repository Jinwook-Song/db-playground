| 프로젝트 기간 | 24.08.23 ~                                                             |
| ------------- | ---------------------------------------------------------------------- |
| 프로젝트 목적 | Study SQL                                                              |
| Github        | https://github.com/Jinwook-Song/db-playground                          |
| docs          |                                                                        |
| data(sqlite)  | https://pub-f13217639d6446309ebabc652f18d0ad.r2.dev/movies_download.db |
| data(json)    | https://pub-f13217639d6446309ebabc652f18d0ad.r2.dev/movies-data.json   |

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

```bash
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
