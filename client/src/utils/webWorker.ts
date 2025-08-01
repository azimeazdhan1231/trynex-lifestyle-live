// Web Worker for background processing to keep main thread responsive
export class WebWorkerUtils {
  static createWorker(script: string): Worker {
    const blob = new Blob([script], { type: 'application/javascript' });
    return new Worker(URL.createObjectURL(blob));
  }

  // Background image processing worker
  static createImageOptimizationWorker(): Worker {
    const workerScript = `
      self.onmessage = function(e) {
        const { imageUrls, action } = e.data;
        
        if (action === 'preload') {
          Promise.all(
            imageUrls.map(url => {
              return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve(url);
                img.onerror = () => reject(url);
                img.src = url;
              });
            })
          ).then(results => {
            self.postMessage({ type: 'preload_complete', results });
          }).catch(error => {
            self.postMessage({ type: 'preload_error', error });
          });
        }
      };
    `;

    return this.createWorker(workerScript);
  }

  // Background data processing worker
  static createDataProcessingWorker(): Worker {
    const workerScript = `
      self.onmessage = function(e) {
        const { products, action } = e.data;
        
        if (action === 'filter') {
          const featured = products.filter(p => p.is_featured);
          const latest = products.filter(p => p.is_latest);
          const bestSelling = products.filter(p => p.is_best_selling);
          
          self.postMessage({
            type: 'filter_complete',
            results: { featured, latest, bestSelling }
          });
        }
      };
    `;

    return this.createWorker(workerScript);
  }
}