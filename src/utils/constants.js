export const getQueryFields = (fieldsArray = []) => fieldsArray.join(",")

export const NOT_AVAILABLE = "NA";
export const RESPONSE_ALL_COUNTRIES_FIELDS = 'RESPONSE_ALL_COUNTRIES_FIELDS';
export const RESPONSE_ONE_COUNTRY_FIELDS = 'RESPONSE_ONE_COUNTRY_FIELDS'

export const responseFields = {
    [RESPONSE_ALL_COUNTRIES_FIELDS] : ['flags', 'name', 'capital', 'region', 'population'],
    [RESPONSE_ONE_COUNTRY_FIELDS]: ['flags', 'name', 'capital', 'region', 'population', 'currencies', 'languages', 'borders']
};

export const GET_ALL_COUNTRIES_URL =
  `https://restcountries.com/v3.1/all?fields=${getQueryFields(responseFields[RESPONSE_ALL_COUNTRIES_FIELDS])}`;