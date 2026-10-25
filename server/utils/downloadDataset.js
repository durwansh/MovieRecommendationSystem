const fs = require('fs');
const path = require('path');
const https = require('https');
const { spawn } = require('child_process');

const DATASET_URL = 'https://huggingface.co/datasets/HenryWaltson/TMDB-IMDB-Movies-Dataset/resolve/main/TMDB%20%20IMDB%20Movies%20Dataset.csv';
const TARGET_FILE = path.join(__dirname, '..', 'tmdb_1m_movies.csv');

async function downloadWithCurl() {
  return new Promise((resolve, reject) => {
    console.log(`🚀 Starting high-speed download using curl.exe...`);
    console.log(`📍 Destination: ${TARGET_FILE}`);
    
    const curl = spawn('curl.exe', ['-L', '--progress-bar', '-o', TARGET_FILE, DATASET_URL], {
      stdio: 'inherit'
    });

    curl.on('close', (code) => {
      if (code === 0 && fs.existsSync(TARGET_FILE) && fs.statSync(TARGET_FILE).size > 1000000) {
        console.log(`\n✅ Download complete! File size: ${(fs.statSync(TARGET_FILE).size / (1024 * 1024)).toFixed(1)} MB`);
        resolve(TARGET_FILE);
      } else {
        reject(new Error(`curl exited with code ${code}`));
      }
    });

    curl.on('error', (err) => {
      reject(err);
    });
  });
}

function downloadWithHttps(url = DATASET_URL, target = TARGET_FILE) {
  return new Promise((resolve, reject) => {
    console.log(`🌐 Downloading dataset via Node.js HTTPS stream...`);
    const file = fs.createWriteStream(target);

    const request = (currentUrl) => {
      https.get(currentUrl, (response) => {
        // Follow redirects
        if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          return request(response.headers.location);
        }

        if (response.statusCode !== 200) {
          return reject(new Error(`Server responded with ${response.statusCode}`));
        }

        const totalBytes = parseInt(response.headers['content-length'], 10) || 476055908;
        let downloadedBytes = 0;
        let lastLogged = 0;

        response.on('data', (chunk) => {
          downloadedBytes += chunk.length;
          file.write(chunk);

          const now = Date.now();
          if (now - lastLogged > 2000) {
            lastLogged = now;
            const pct = ((downloadedBytes / totalBytes) * 100).toFixed(1);
            const mb = (downloadedBytes / (1024 * 1024)).toFixed(1);
            const totalMb = (totalBytes / (1024 * 1024)).toFixed(1);
            process.stdout.write(`\r📥 Downloaded: ${mb}MB / ${totalMb}MB (${pct}%)`);
          }
        });

        response.on('end', () => {
          file.end();
          console.log(`\n✅ Successfully downloaded TMDB 1M dataset (${(downloadedBytes / (1024 * 1024)).toFixed(1)} MB)!`);
          resolve(target);
        });

        response.on('error', (err) => {
          fs.unlink(target, () => {});
          reject(err);
        });
      }).on('error', (err) => {
        fs.unlink(target, () => {});
        reject(err);
      });
    };

    request(url);
  });
}

async function main() {
  if (fs.existsSync(TARGET_FILE) && fs.statSync(TARGET_FILE).size > 100000000) {
    console.log(`⚡ Dataset already downloaded at: ${TARGET_FILE}`);
    console.log(`📊 Size: ${(fs.statSync(TARGET_FILE).size / (1024 * 1024)).toFixed(1)} MB`);
    return TARGET_FILE;
  }

  try {
    return await downloadWithCurl();
  } catch (err) {
    console.warn(`⚠️ curl failed (${err.message}), falling back to Node.js stream...`);
    return await downloadWithHttps();
  }
}

if (require.main === module) {
  main().catch(err => {
    console.error('❌ Download failed:', err);
    process.exit(1);
  });
}

module.exports = {
  downloadDataset: main,
  TARGET_FILE,
  DATASET_URL
};
