import mysql from "mysql2/promise";
import City from "../models/city.mjs";
import Country from "../models/country.mjs";

export default class DatabaseService {
  conn;

  constructor(conn) {
    this.conn = conn;
  }

  /* Establish database connection and return the instance */
  static async connect() {
    const conn = await mysql.createConnection({
      host: process.env.DATABASE_HOST || "localhost",
      user: "user",
      password: "password",
      database: "world",
    });

    return new DatabaseService(conn);
  }

  /* Get a list of all cities */
  async getCities() {
    try {
      // Fetch cities from database
      const data = await this.conn.execute("SELECT * FROM `city`");
      return data;
    } catch (err) {
      // Handle error...
      console.error(err);
      return undefined;
    }
  }

  /* Get a list of all capitals */
  async getCapitals() {
    try {
      // Fetch capitals from database
      const sql = `SELECT country.Code, city.* FROM country INNER JOIN city ON country.Capital = city.ID`;
      const data = await this.conn.execute(sql);
      return data;
    } catch (err) {
      // Handle error...
      console.error(err);
      return undefined;
    }
  }

  /* Get a list of all languages */
  async getLanguages() {
    try {
      // Fetch languages from database
      const sql = `SELECT * FROM countrylanguage`;
      const data = await this.conn.execute(sql);
      return data;
    } catch (err) {
      // Handle error...
      console.error(err);
      return undefined;
    }
  }

  /* Get a list of all languages */
  async getPopularLanguages() {
    try {
      const lang = "Chinese";
      // Fetch popular languages from database
      const sql = `SELECT countrylanguage.Language, SUM(country.Population * countrylanguage.Percentage * 0.01) as number 
          FROM countrylanguage INNER JOIN country ON country.Code = countrylanguage.CountryCode 
          GROUP BY countrylanguage.Language
        `;
      const data = await this.conn.execute(sql);
      return data;
    } catch (err) {
      // Handle error...
      console.error(err);
      return undefined;
    }
  }

  /* Get a particular city by ID, including country information */
  async getCity(cityId) {
    const sql = `
        SELECT city.*, country.Name AS Country, country.Region, country.Continent, country.Population as CountryPopulation
        FROM city
        INNER JOIN country ON country.Code = city.CountryCode
        WHERE city.ID = ${cityId}
    `;
    const [rows, fields] = await this.conn.execute(sql);
    /* Get the first result of the query (we're looking up the city by ID, which should be unique) */
    const data = rows[0];
    const city = new City(
      data.ID,
      data.Name,
      data.CountryCode,
      data.District,
      data.Population
    );
    const country = new Country(
      data.Code,
      data.Country,
      data.Continent,
      data.Region,
      data.CountryPopulation
    );
    city.country = country;
    return city;
  }

  /* Delete a city by ID */
  async removeCity(cityId) {
    const res = await this.conn.execute(
      `DELETE FROM city WHERE id = ${cityId}`
    );
    console.log(res);
    return res;
  }

  /* Get a list of countries */
  async getCountries() {
    const sql = `SELECT country.*, city.Name as Capital_Name FROM country INNER JOIN city ON country.Capital = city.ID`;
    const [rows, fields] = await this.conn.execute(sql);
    const countries = rows.map(c => new Country(c.Code, c.Name, c.Continent, c.Region, c.Population, c.Capital_Name));
    return countries;
  }
}