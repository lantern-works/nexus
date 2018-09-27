import pandas as pd
from sklearn import preprocessing

# Initialize the scaling function
min_max_scaler = preprocessing.MinMaxScaler()

df = pd.read_csv('boston_flood_training.csv') 

#Retaining relevant columns
df = df[['Distance_from_disaster_spot','Area_Population','Number_of_service_requests'\
         ,'Infant_population','Aged_population','Emergency_level','Hours_since_last_supply','Quality_score',\
        'Ideal_distribution']]
print(df.head())

data = df.values.astype(float)

scaled_data = min_max_scaler.fit_transform(data)

df_normalized = pd.DataFrame(scaled_data, columns=list(df.columns.values))

print(df_normalized.head())

df_normalized.to_csv('normalized_boston_flood_training.csv', index= False)
