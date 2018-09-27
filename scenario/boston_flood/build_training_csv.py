from lib.database import getDocsForEvents
from lib.csvmaker import writeCSV
import pandas as pd
from sklearn import preprocessing
from sklearn.externals import joblib

save_path = '~/Desktop/Project_lantern/nexus/scenario/boston_flood/'


def drop_redudancies(df):
    df = df[['Distance_from_disaster_spot', 'Area_Population', 'Number_of_service_requests',
             'Infant_population', 'Aged_population', 'Emergency_level', 'Hours_since_last_supply',
             'Quality_score', 'Ideal_distribution']]
    return df


def split_test_data(df):
    test_set = df.iloc[1500:2000]
    train_set = df[:1500]
    return train_set, test_set


def scale_values(df,scaler):
    data = df.values.astype(float)
    scaled_data = scaler.transform(data)
    df_normalized = pd.DataFrame(scaled_data, columns=list(df.columns.values))
    print(df_normalized.head())
    return df_normalized


def normalize_data(file_name):
    min_max_scaler = preprocessing.MinMaxScaler()
    df = pd.read_csv(file_name)
    df = drop_redudancies(df)
    print(df.head())
    print('\n\n')
    data = df.values.astype(float)
    min_max_scaler.fit(data)
    joblib.dump(min_max_scaler, 'data_scaler.joblib')
    train_set, test_set = split_test_data(df)
    normalized_train_set = scale_values(train_set,min_max_scaler)
    normalized_test_set = scale_values(test_set, min_max_scaler)

    normalized_train_set.to_csv('normalized_boston_flood_training.csv', index=False)
    normalized_test_set.to_csv('normalized_boston_flood_testing.csv', index=False)

    return print('done')


grouped_docs = getDocsForEvents(["e:boston_X8E29", "e:boston_19EC4"])

for kind, docs in grouped_docs.items():
    print(kind + "--------")
    for doc in docs:
        print(doc);
    print('\n')
print("\n\n")

writeCSV("boston_flood_training.csv", grouped_docs)


normalize_data('boston_flood_training.csv')
