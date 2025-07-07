## Fake News Detector

1. Ideation: Create a machine learning model to detect fake news online
2. Data Collection: Gather a dataset of news articles labeled as real or fake
3. Explore the Data
4. Build a training pipeline
5. Train the model and evaluate its performance
6. Perform error analysis and retrain
7. Deploy the model as a web service (API)
8. Create chrome extension to use the model

# Dataset Source
Dataset is sourced from this link: [Github](https://github.com/kapilsinghnegi/Fake-News-Detection/tree/main/Datasets)

# Extension Installation
1. Donwload the folder extension from this repo in the releases section. 
2. Open Chrome and go to `chrome://extensions/`.
3. Enable "Developer mode" at the top right corner.
4. Click on "Load unpacked" and select the `extension` folder.
5. The extension should now be installed and ready to use.

# Installation and Training Steps

Step 1:
```
git clone https://github.com/yxlow07/fake-news-detector.git
cd fake-news-detector
pip install -r requirements.txt
```

Clone the repo and install the required packages. 

Step 2:
Run the `cleaning.ipynb` notebook to generate the cleaned dataset.

Step 3:
Run the `train_model.ipynb` notebook to train the model.

Step 4:
```
uvicorn deploy:app --reload
```

Run the `deploy.py` file to deploy the model as a web service using uvicorn.
