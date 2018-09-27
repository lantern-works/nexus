from lib.database import getDocsForEvents
from lib.csvmaker import writeCSV
import pandas as pd
from sklearn import preprocessing
import pickle

grouped_docs = getDocsForEvents(["e:boston_X8E29", "e:boston_19EC4"])

for kind, docs in grouped_docs.items():
    print(kind + "--------")
    for doc in docs:
        print(doc);
    print('\n')
print("\n\n")

writeCSV("boston_flood_training.csv", grouped_docs)


def normalize_data(file_name):
    min_max_scaler = preprocessing.MinMaxScaler()
    df = pd.read_csv('boston_flood_training.csv')
    df = df[['Distance_from_disaster_spot', 'Area_Population', 'Number_of_service_requests' \
        , 'Infant_population', 'Aged_population', 'Emergency_level', 'Hours_since_last_supply', 'Quality_score', \
             'Ideal_distribution']]
    print(df.head())

    data = df.values.astype(float)
    model = min_max_scaler.fit(data)

    data_scaler = pickle.dumps(model)

    scaled_data = model.transform(data)

    df_normalized = pd.DataFrame(scaled_data, columns=list(df.columns.values))

    print(df_normalized.head())

    df_normalized.to_csv('normalized_boston_flood_training.csv', index=False)

    return print('done')
