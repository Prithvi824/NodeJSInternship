## How to run:

1) Create a .env file with the following keys and fill their values:
    - `SQL_PASSWORD`=`<SQL Password>`
    - `DATABASE_NAME`="school_management"
    - `SQL_HOST`=`<SQL Host>`
    - `SQL_USER`=`<SQL User>`
    
2) Install dependencies:
```bash
    npm install
```

3) Run the server
```bash
    node server.js
```

## API's available

#### `/addSchool`

**Method**: POST

**Description** : The Add School API allows users to add a new school to the database. It accepts a POST request with a JSON payload containing the name, address, latitude, and longitude of the school. The API validates all input fields to ensure they are non-empty and conform to the correct data types. Upon successful validation, the new school is added to the schools table, and a confirmation response is returned.

#### `/listSchools`

**Method**: GET

**Description** : The List Schools API provides users with a sorted list of schools based on their proximity to a specified location. It accepts a GET request with query parameters for the user's latitude and longitude. The API retrieves all schools from the database and calculates the geographical distance between each school and the user's location using the Haversine formula. The results are returned as a list sorted by proximity, starting with the closest school.


## Online testing

The service can be tested against this domain:  [Available here](https://nodejsinternship.onrender.com)
