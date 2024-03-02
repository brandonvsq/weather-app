import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

const app = express();
const port = 3000;
const API_KEY = "d589e8c8f3f5c6aefa05bf1981c2e2d2";

let countryCode = "";
let lat = "";
let lon = "";

// Middleware
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

// Main get route
app.get("/", async (req, res) => {
    console.log("The '/' route has been activated");

    // Logic that runs another API get request once lat and lon values are present
    if (lat && lon) {
        try {
            const result = await axios.get("https://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lon + "&appid=" + API_KEY);
            console.log(JSON.stringify(result.data));

            // Convert Kelvin units into Fahrenheit units
            const tempInKelvin = result.data.main.temp;
            const feelsLikeInKelvin = result.data.main.feels_like;

            const temperatureFahrenheit = (tempInKelvin - 273.15) * 9/5 + 32;
            const feelsLikeFahrenheit = (feelsLikeInKelvin - 273.15) * 9/5 + 32;

            // Render index.ejs with data pulled from API
            res.render("index.ejs", { 
                content: result.data.weather[0].main,
                name: result.data.name,
                temperature: temperatureFahrenheit.toFixed(2),
                feelsLike: feelsLikeFahrenheit.toFixed(2)
            });
        } catch (error) {
            res.status(500).send("Internal Server Error");
        } 
    } else {
        console.log("Lat and Lon are not present");
        res.render("index.ejs");
    }
});

app.post("/submit", async (req, res) => {
    console.log("The '/submit' route has been activated");
    const zipCode = req.body.zipcode;
    const country = req.body.country;

    // Switch statment that helps gather country codes from US, Canada and UK.
    switch(country.toUpperCase()) {
        case "US":
        case "USA":
            countryCode = "US";
            break;
        case "CA":
        case "CAN":
        case "CANADA":
            countryCode = "CA";
            break;
        case "UK":
        case "GB":
        case "GBR":
        case "UNITED KINGDOM":
            countryCode = "GB";
            break;
        default:
            countryCode = "";
    }

    // API get request that gets lat and lon values based on zipcode / postal code & country code
    try {
        const result = await axios.get("http://api.openweathermap.org/geo/1.0/zip?zip=" + zipCode + "," + countryCode + "&appid=" + API_KEY);
        lat = JSON.stringify(result.data.lat);
        lon = JSON.stringify(result.data.lon);
        console.log(lat);
        console.log(lon);
        // Redirects to homepage with the lat / lon values received from the API
        res.redirect("/?lat=" + lat + "&lon=" + lon);
    } catch (error) {
        res.status(500);
    }
});

app.listen(port, () => {
    console.log(`This server is running on port ${port}`);
})