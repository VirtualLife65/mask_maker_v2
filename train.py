import os
import librosa
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader

# -------------- Dataset --------------
class AudioDataset(Dataset):
    def __init__(self, folder_path):
        self.folder_path = folder_path
        self.file_list = os.listdir(folder_path)

    def __len__(self):
        return len(self.file_list)

    def __getitem__(self, idx):
        audio_path = os.path.join(self.folder_path, self.file_list[idx])
        audio, sr = librosa.load(audio_path, sr=44100)
        audio = torch.tensor(audio).float()
        return audio

# -------------- Simple Model --------------
class SimpleSeparator(nn.Module):
    def __init__(self):
        super(SimpleSeparator, self).__init__()
        self.fc = nn.Linear(44100, 44100)

    def forward(self, x):
        return self.fc(x)

# -------------- Training --------------
def train():
    dataset = AudioDataset('dataset/train')
    dataloader = DataLoader(dataset, batch_size=2, shuffle=True)

    model = SimpleSeparator()
    optimizer = optim.Adam(model.parameters(), lr=0.001)
    criterion = nn.MSELoss()

    for epoch in range(5):  # Just 5 epochs for now
        for batch in dataloader:
            optimizer.zero_grad()
            output = model(batch)
            loss = criterion(output, batch)
            loss.backward()
            optimizer.step()
        print(f"Epoch {epoch+1}, Loss: {loss.item()}")

    # Save the model
    torch.save(model.state_dict(), 'model.pth')
    print("Model saved as model.pth!")

if __name__ == "__main__":
    train()