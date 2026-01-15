import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  ContractVerificationInfo,
  ContractDetails,
  ContractsListResponse,
  VerificationRequest,
  Create2VerificationRequest,
  VerificationJob,
  SimilaritySearchRequest,
  SimilaritySearchResponse,
  ContractField,
} from '../types/index.js';
import { SourcifyError, handleSourcifyError } from '../utils/index.js';
import { API_TIMEOUT } from '../config/index.js';

export class SourcifyClient {
  private client: AxiosInstance;
  private baseUrl: string;

  constructor(baseUrl: string = 'https://sourcify.dev/server') {
    this.baseUrl = baseUrl;
    this.client = axios.create({
      baseURL: baseUrl,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        throw handleSourcifyError(error);
      }
    );
  }

  /**
   * List verified contracts for a chain with pagination
   */
  async listContracts(
    chainId: string,
    options?: {
      limit?: number;
      sort?: 'asc' | 'desc';
      afterMatchId?: string;
    }
  ): Promise<ContractsListResponse> {
    const params = new URLSearchParams();
    if (options?.limit) params.append('limit', Math.min(options.limit, 200).toString());
    if (options?.sort) params.append('sort', options.sort);
    if (options?.afterMatchId) params.append('afterMatchId', options.afterMatchId);

    const response = await this.client.get<ContractsListResponse>(
      `/v2/contracts/${chainId}?${params.toString()}`
    );
    return response.data;
  }

  /**
   * Get specific contract details with field selection
   */
  async getContract(
    chainId: string,
    address: string,
    options?: {
      fields?: ContractField[];
      omit?: ContractField[];
    }
  ): Promise<ContractDetails> {
    const params = new URLSearchParams();

    if (options?.fields) {
      if (options.fields.includes('all')) {
        params.append('fields', 'all');
      } else {
        params.append('fields', options.fields.join(','));
      }
    }

    if (options?.omit) {
      params.append('omit', options.omit.join(','));
    }

    const response = await this.client.get<ContractDetails>(
      `/v2/contract/${chainId}/${address}?${params.toString()}`
    );
    return response.data;
  }

  /**
   * Verify a contract (session-based, returns job ID)
   */
  async verifyContract(request: VerificationRequest): Promise<VerificationJob> {
    const response = await this.client.post<VerificationJob>('/verify', request);
    return response.data;
  }

  /**
   * Verify a CREATE2 contract
   */
  async verifyCreate2Contract(request: Create2VerificationRequest): Promise<VerificationJob> {
    const response = await this.client.post<VerificationJob>('/verify/create2', request);
    return response.data;
  }

  /**
   * Check verification job status
   */
  async getJobStatus(jobId: string): Promise<VerificationJob> {
    const response = await this.client.get<VerificationJob>(`/jobs/${jobId}`);
    return response.data;
  }

  /**
   * Find similar contracts by bytecode
   */
  async findSimilarContracts(request: SimilaritySearchRequest): Promise<SimilaritySearchResponse> {
    const response = await this.client.post<SimilaritySearchResponse>(
      '/v2/verify/similarity',
      request
    );
    return response.data;
  }
}
