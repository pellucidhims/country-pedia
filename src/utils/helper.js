import { NOT_AVAILABLE, RESPONSE_ALL_COUNTRIES_FIELDS, responseFields, getQueryFields } from "./constants";

export const formatPopulation = (count) => {
  if (count >= 1_000_000_000) {
    return `${(count / 1_000_000_000).toFixed(2)  }B`;
  } if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(2)  }M`;
  } if (count >= 1_000) {
    return `${(count / 1_000).toFixed(2)  }K`;
  } 
    return count?.toString();
  
};


export const checkForAvailableValues = (data) => {
    if(!data || !Object.keys(data).length) return NOT_AVAILABLE;
    return data;
};

export const debounce = (fn, delay) => {
    let timeoutId;
    return  (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            fn.call(this, ...args)
        }, delay);
    }
}

export const getSearchApiUrls = (searchTerm, searchKeys, includeFieldsInResponse) => searchKeys.map(key => `https://restcountries.com/v3.1/${key}/${searchTerm}${includeFieldsInResponse?.length ? `?fields=${getQueryFields(includeFieldsInResponse)}` : ""}`)


export const getSearchesFromWeb =  (searchTerm, searchKeys = ['region', 'lang', 'currency', 'capital'], includeFieldsInResponse = responseFields[RESPONSE_ALL_COUNTRIES_FIELDS]) => new Promise((resolve, reject) => {
        if(!searchTerm) {return reject('No Search query provided!')};

        const searchUrls = getSearchApiUrls(searchTerm, searchKeys, includeFieldsInResponse);
        
        Promise.allSettled(searchUrls.map(url => fetch(url)))
            .then(responses => {
                const fulfilledResponse = responses.reduce((allResults, result) => {
                    if(result?.status === 'fulfilled' && result?.value?.status === 200){
                        allResults.push(result.value.json());
                    }
                    return allResults;
                }, []);
                Promise.all(fulfilledResponse).then(finalData => {
                    resolve(finalData)
                });
                
            })
            .catch((error) => { 
                console.error(error.message);
            })
    })