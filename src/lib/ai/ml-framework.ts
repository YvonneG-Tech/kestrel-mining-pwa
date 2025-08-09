// AI/ML Framework for Mining Operations Analytics

import * as tf from '@tensorflow/tfjs';

export interface MLModel {
  id: string;
  name: string;
  type: 'regression' | 'classification' | 'timeseries' | 'anomaly_detection';
  version: string;
  accuracy?: number;
  lastTrained: Date;
  isLoaded: boolean;
  model?: tf.LayersModel | tf.GraphModel;
}

export interface TrainingData {
  features: number[][];
  labels: number[];
  featureNames: string[];
  targetName: string;
}

export interface PredictionResult {
  value: number | number[];
  confidence: number;
  explanation?: string;
  recommendations?: string[];
  timestamp: Date;
}

export interface ModelMetrics {
  accuracy: number;
  precision?: number;
  recall?: number;
  f1Score?: number;
  mse?: number;
  rmse?: number;
  mae?: number;
}

export class MLFramework {
  private models = new Map<string, MLModel>();
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Initialize TensorFlow.js backend
    await tf.ready();
    console.log('🧠 TensorFlow.js backend initialized:', tf.getBackend());
    
    this.isInitialized = true;
  }

  async loadModel(modelConfig: {
    id: string;
    name: string;
    type: MLModel['type'];
    modelUrl?: string;
    localModel?: tf.LayersModel;
  }): Promise<MLModel> {
    await this.initialize();

    let model: tf.LayersModel | tf.GraphModel | undefined;

    if (modelConfig.modelUrl) {
      try {
        model = await tf.loadLayersModel(modelConfig.modelUrl);
        console.log(`📥 Loaded model ${modelConfig.name} from URL`);
      } catch (error) {
        console.error(`Failed to load model from URL:`, error);
      }
    } else if (modelConfig.localModel) {
      model = modelConfig.localModel;
      console.log(`📥 Loaded local model ${modelConfig.name}`);
    }

    const mlModel: MLModel = {
      id: modelConfig.id,
      name: modelConfig.name,
      type: modelConfig.type,
      version: '1.0.0',
      lastTrained: new Date(),
      isLoaded: !!model,
      model,
    };

    this.models.set(modelConfig.id, mlModel);
    return mlModel;
  }

  async createModel(config: {
    id: string;
    name: string;
    type: MLModel['type'];
    inputShape: number[];
    outputShape: number;
    architecture?: 'simple' | 'deep' | 'lstm' | 'cnn';
  }): Promise<MLModel> {
    await this.initialize();

    let model: tf.LayersModel;

    switch (config.architecture) {
      case 'lstm':
        model = this.createLSTMModel(config.inputShape, config.outputShape);
        break;
      case 'deep':
        model = this.createDeepModel(config.inputShape, config.outputShape);
        break;
      case 'cnn':
        model = this.createCNNModel(config.inputShape, config.outputShape);
        break;
      default:
        model = this.createSimpleModel(config.inputShape, config.outputShape);
    }

    const mlModel: MLModel = {
      id: config.id,
      name: config.name,
      type: config.type,
      version: '1.0.0',
      lastTrained: new Date(),
      isLoaded: true,
      model,
    };

    this.models.set(config.id, mlModel);
    return mlModel;
  }

  private createSimpleModel(inputShape: number[], outputSize: number): tf.LayersModel {
    const model = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape, units: 64, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 32, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: outputSize, activation: outputSize === 1 ? 'linear' : 'softmax' }),
      ],
    });

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: outputSize === 1 ? 'meanSquaredError' : 'sparseCategoricalCrossentropy',
      metrics: ['accuracy'],
    });

    return model;
  }

  private createDeepModel(inputShape: number[], outputSize: number): tf.LayersModel {
    const model = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape, units: 128, activation: 'relu' }),
        tf.layers.batchNormalization(),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({ units: 64, activation: 'relu' }),
        tf.layers.batchNormalization(),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({ units: 32, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: outputSize, activation: outputSize === 1 ? 'linear' : 'softmax' }),
      ],
    });

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: outputSize === 1 ? 'meanSquaredError' : 'sparseCategoricalCrossentropy',
      metrics: ['accuracy'],
    });

    return model;
  }

  private createLSTMModel(inputShape: number[], outputSize: number): tf.LayersModel {
    const model = tf.sequential({
      layers: [
        tf.layers.lstm({ 
          inputShape: [inputShape[0], inputShape[1]], 
          units: 50, 
          returnSequences: true 
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.lstm({ units: 50, returnSequences: false }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 25, activation: 'relu' }),
        tf.layers.dense({ units: outputSize, activation: 'linear' }),
      ],
    });

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mae'],
    });

    return model;
  }

  private createCNNModel(inputShape: number[], outputSize: number): tf.LayersModel {
    const model = tf.sequential({
      layers: [
        tf.layers.conv1d({
          inputShape: [inputShape[0], inputShape[1]],
          filters: 32,
          kernelSize: 3,
          activation: 'relu',
        }),
        tf.layers.maxPooling1d({ poolSize: 2 }),
        tf.layers.conv1d({ filters: 64, kernelSize: 3, activation: 'relu' }),
        tf.layers.globalAveragePooling1d(),
        tf.layers.dense({ units: 50, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: outputSize, activation: outputSize === 1 ? 'linear' : 'softmax' }),
      ],
    });

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: outputSize === 1 ? 'meanSquaredError' : 'sparseCategoricalCrossentropy',
      metrics: ['accuracy'],
    });

    return model;
  }

  async trainModel(
    modelId: string,
    trainingData: TrainingData,
    options: {
      epochs?: number;
      batchSize?: number;
      validationSplit?: number;
      patience?: number;
    } = {}
  ): Promise<ModelMetrics> {
    const mlModel = this.models.get(modelId);
    if (!mlModel || !mlModel.model) {
      throw new Error(`Model ${modelId} not found or not loaded`);
    }

    const { epochs = 100, batchSize = 32, validationSplit = 0.2, patience = 10 } = options;

    // Convert data to tensors
    const xs = tf.tensor2d(trainingData.features);
    const ys = tf.tensor(trainingData.labels);

    // Early stopping callback
    const earlyStopping = tf.callbacks.earlyStopping({
      monitor: 'val_loss',
      patience,
      restoreBestWeights: true,
    });

    // Train the model (cast to LayersModel since only LayersModel has fit method)
    const history = await (mlModel.model as tf.LayersModel).fit(xs, ys, {
      epochs,
      batchSize,
      validationSplit,
      callbacks: [earlyStopping],
      verbose: 1,
    });

    // Clean up tensors
    xs.dispose();
    ys.dispose();

    // Calculate metrics
    const finalLoss = history.history.loss[history.history.loss.length - 1] as number;
    const finalValLoss = history.history.val_loss ? 
      history.history.val_loss[history.history.val_loss.length - 1] as number : 
      finalLoss;

    const metrics: ModelMetrics = {
      accuracy: 1 - finalValLoss, // Simplified accuracy calculation
      mse: finalLoss,
      rmse: Math.sqrt(finalLoss),
    };

    // Update model info
    mlModel.lastTrained = new Date();
    mlModel.accuracy = metrics.accuracy;

    console.log(`🎯 Model ${mlModel.name} training completed:`, metrics);
    return metrics;
  }

  async predict(
    modelId: string,
    inputData: number[] | number[][],
    options: {
      returnConfidence?: boolean;
      batchSize?: number;
    } = {}
  ): Promise<PredictionResult> {
    const mlModel = this.models.get(modelId);
    if (!mlModel || !mlModel.model) {
      throw new Error(`Model ${modelId} not found or not loaded`);
    }

    const { returnConfidence = true } = options;

    // Ensure input is 2D
    const input2D = Array.isArray(inputData[0]) ? inputData as number[][] : [inputData as number[]];
    const inputTensor = tf.tensor2d(input2D);

    try {
      const prediction = mlModel.model.predict(inputTensor) as tf.Tensor;
      const predictionData = await prediction.data();
      
      // Calculate confidence (simplified)
      let confidence = 0.8; // Default confidence
      if (returnConfidence && mlModel.type === 'classification') {
        const probabilities = Array.from(predictionData);
        confidence = Math.max(...probabilities);
      }

      const result: PredictionResult = {
        value: predictionData.length === 1 ? predictionData[0] : Array.from(predictionData),
        confidence,
        timestamp: new Date(),
      };

      // Clean up
      inputTensor.dispose();
      prediction.dispose();

      return result;
    } catch (error) {
      inputTensor.dispose();
      throw new Error(`Prediction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async saveModel(modelId: string, savePath: string): Promise<void> {
    const mlModel = this.models.get(modelId);
    if (!mlModel || !mlModel.model) {
      throw new Error(`Model ${modelId} not found or not loaded`);
    }

    await mlModel.model.save(savePath);
    console.log(`💾 Model ${mlModel.name} saved to ${savePath}`);
  }

  getModel(modelId: string): MLModel | undefined {
    return this.models.get(modelId);
  }

  getAllModels(): MLModel[] {
    return Array.from(this.models.values());
  }

  getModelSummary(modelId: string): string {
    const mlModel = this.models.get(modelId);
    if (!mlModel || !mlModel.model) {
      return `Model ${modelId} not found`;
    }

    const layers = (mlModel.model as tf.LayersModel).layers;
    const totalParams = (mlModel.model as tf.LayersModel).countParams();

    return `
Model: ${mlModel.name} (${mlModel.type})
Version: ${mlModel.version}
Total Parameters: ${totalParams.toLocaleString()}
Accuracy: ${mlModel.accuracy ? (mlModel.accuracy * 100).toFixed(2) + '%' : 'Not trained'}
Last Trained: ${mlModel.lastTrained.toLocaleString()}
Layers: ${layers.length}
Architecture: ${layers.map(layer => layer.constructor.name).join(' → ')}
    `.trim();
  }
}

// Singleton instance
let mlFramework: MLFramework | null = null;

export function getMLFramework(): MLFramework {
  if (!mlFramework) {
    mlFramework = new MLFramework();
  }
  return mlFramework;
}

// Data preprocessing utilities
export class DataPreprocessor {
  static normalize(data: number[][]): { normalized: number[][]; min: number[]; max: number[] } {
    if (data.length === 0) throw new Error('Empty data array');
    
    const features = data[0].length;
    const min = new Array(features).fill(Infinity);
    const max = new Array(features).fill(-Infinity);

    // Find min and max for each feature
    for (const row of data) {
      for (let i = 0; i < features; i++) {
        min[i] = Math.min(min[i], row[i]);
        max[i] = Math.max(max[i], row[i]);
      }
    }

    // Normalize data
    const normalized = data.map(row =>
      row.map((value, i) => {
        const range = max[i] - min[i];
        return range === 0 ? 0 : (value - min[i]) / range;
      })
    );

    return { normalized, min, max };
  }

  static standardize(data: number[][]): { standardized: number[][]; mean: number[]; std: number[] } {
    if (data.length === 0) throw new Error('Empty data array');
    
    const features = data[0].length;
    const mean = new Array(features).fill(0);
    const std = new Array(features).fill(0);

    // Calculate mean
    for (const row of data) {
      for (let i = 0; i < features; i++) {
        mean[i] += row[i];
      }
    }
    for (let i = 0; i < features; i++) {
      mean[i] /= data.length;
    }

    // Calculate standard deviation
    for (const row of data) {
      for (let i = 0; i < features; i++) {
        std[i] += Math.pow(row[i] - mean[i], 2);
      }
    }
    for (let i = 0; i < features; i++) {
      std[i] = Math.sqrt(std[i] / data.length);
    }

    // Standardize data
    const standardized = data.map(row =>
      row.map((value, i) => {
        return std[i] === 0 ? 0 : (value - mean[i]) / std[i];
      })
    );

    return { standardized, mean, std };
  }

  static createTimeSeriesSequences(
    data: number[],
    sequenceLength: number,
    predictionHorizon: number = 1
  ): { sequences: number[][]; targets: number[] } {
    const sequences: number[][] = [];
    const targets: number[] = [];

    for (let i = 0; i <= data.length - sequenceLength - predictionHorizon; i++) {
      const sequence = data.slice(i, i + sequenceLength);
      const target = data[i + sequenceLength + predictionHorizon - 1];
      sequences.push(sequence);
      targets.push(target);
    }

    return { sequences, targets };
  }
}