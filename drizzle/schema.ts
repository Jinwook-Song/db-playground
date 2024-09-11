import { sqliteTable, AnySQLiteColumn, index, integer, text, real } from "drizzle-orm/sqlite-core"
  import { sql } from "drizzle-orm"

export const movies = sqliteTable("movies", {
	movieId: integer("movie_id").primaryKey(),
	title: text("title"),
	originalTitle: text("original_title"),
	originalLanguage: text("original_language"),
	overview: text("overview"),
	releaseDate: integer("release_date"),
	revenue: integer("revenue"),
	budget: integer("budget"),
	homepage: text("homepage"),
	runtime: integer("runtime"),
	rating: real("rating"),
	status: text("status"),
	country: text("country"),
	genres: text("genres"),
	director: text("director"),
	spokenLanguages: text("spoken_languages"),
},
(table) => {
	return {
		idxReleaseRating: index("idx_release_rating").on(table.releaseDate, table.rating),
	}
});