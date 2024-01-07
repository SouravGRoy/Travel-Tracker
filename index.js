import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const db = new pg.Client({
  host: "localhost",
  user: "postgres",
  database: "world",
  password: "protsai7",
  port: 5433,
});

const app = express();
const port = 3000;

// Set the view engine to EJS
app.set("view engine", "ejs"); // You need to install 'ejs' via npm/yarn

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

async function checkVisited(){
  const result = await db.query("SELECT country_code FROM visited_countries");

  let countries =[];
  result.rows.forEach((country)=>{
    countries.push(country.country_code);
  });
  return countries;
}

app.get("/", async (req, res) => {
const countries = await checkVisited();
res.render("index.ejs",{countries:countries,total:countries.length})
});
//iNSERT ADD Route//

app.post("/add",async (req,res)=>{
const input = req.body["country"]

try{
  const result = await db.query(
    "SELECT country_code FROM countries WHERE country_name = $1",
    [input]
  )
 const data = result.rows[0]
 const countryCode = data.country_code;
 try{
  await db.query("INSERT INTO visited_countries (country_code) VALUES ($1)",
    [countryCode],
  );
  res.redirect("/");
 }  
 catch(err){
 console.log(err);
 const countries = await checkVisited();
 res.render("index.ejs",{
  countries:countries,
  total:countries.length,
  error:"Country has already been added,try again"
 }
 );
 }
 }
catch(err){
console.log(err);
const countries = await checkVisited();
res.render("index.ejs",{
  countries:countries,
  total:countries.length,
  error:"Country name does not exist,try again.",
});
};
})
// ADD//
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
