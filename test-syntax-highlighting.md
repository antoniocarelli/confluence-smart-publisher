# 🎨 Teste de Syntax Highlighting

Este arquivo demonstra o suporte completo a syntax highlighting para as principais linguagens de programação no preview.

## 🚀 Linguagens de Programação

### Java

```java
public class HelloWorld {
    private static final String MESSAGE = "Hello, World!";
    
    public static void main(String[] args) {
        System.out.println(MESSAGE);
        
        // Exemplo com estruturas de controle
        for (int i = 0; i < 10; i++) {
            if (i % 2 == 0) {
                System.out.println("Número par: " + i);
            }
        }
        
        // Exemplo com classes e objetos
        List<String> items = new ArrayList<>();
        items.add("Item 1");
        items.add("Item 2");
        
        items.stream()
             .filter(item -> item.contains("1"))
             .forEach(System.out::println);
    }
}
```

### Python

```python
import json
import asyncio
from typing import List, Dict, Optional
from dataclasses import dataclass

@dataclass
class User:
    id: int
    name: str
    email: str
    active: bool = True

class UserService:
    def __init__(self, database_url: str):
        self.database_url = database_url
        self.users: List[User] = []
    
    async def create_user(self, name: str, email: str) -> User:
        """Cria um novo usuário no sistema"""
        user_id = len(self.users) + 1
        new_user = User(id=user_id, name=name, email=email)
        self.users.append(new_user)
        
        # Log da criação
        print(f"Usuário criado: {new_user.name} ({new_user.email})")
        return new_user
    
    def find_user_by_email(self, email: str) -> Optional[User]:
        """Busca usuário por email"""
        return next((user for user in self.users if user.email == email), None)

# Exemplo de uso
async def main():
    service = UserService("postgresql://localhost:5432/mydb")
    user = await service.create_user("João Silva", "joao@example.com")
    
    # Serialização JSON
    user_data = {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "active": user.active
    }
    
    print(json.dumps(user_data, indent=2))

if __name__ == "__main__":
    asyncio.run(main())
```

### JavaScript

```javascript
// Exemplo moderno com ES6+ features
class TaskManager {
    constructor(apiUrl) {
        this.apiUrl = apiUrl;
        this.tasks = new Map();
        this.eventListeners = [];
    }
    
    // Método assíncrono para buscar tarefas
    async fetchTasks() {
        try {
            const response = await fetch(`${this.apiUrl}/tasks`);
            const data = await response.json();
            
            // Destructuring e arrow functions
            const activeTasks = data.filter(({ completed }) => !completed);
            
            activeTasks.forEach(task => {
                this.tasks.set(task.id, {
                    ...task,
                    createdAt: new Date(task.createdAt)
                });
            });
            
            return activeTasks;
        } catch (error) {
            console.error('Erro ao buscar tarefas:', error);
            throw new Error(`Falha na API: ${error.message}`);
        }
    }
    
    // Template literals e métodos modernos
    createTask(title, description = '') {
        const newTask = {
            id: crypto.randomUUID(),
            title,
            description,
            completed: false,
            createdAt: new Date(),
            tags: []
        };
        
        this.tasks.set(newTask.id, newTask);
        this.notifyListeners('taskCreated', newTask);
        
        return newTask;
    }
    
    // Event handling com callbacks
    addEventListener(event, callback) {
        this.eventListeners.push({ event, callback });
    }
    
    notifyListeners(event, data) {
        this.eventListeners
            .filter(listener => listener.event === event)
            .forEach(listener => listener.callback(data));
    }
}

// Uso com async/await e Promise
const taskManager = new TaskManager('https://api.example.com');

taskManager.addEventListener('taskCreated', (task) => {
    console.log(`Nova tarefa criada: ${task.title}`);
});

// IIFE com try/catch
(async () => {
    try {
        await taskManager.fetchTasks();
        const newTask = taskManager.createTask('Implementar syntax highlighting');
        console.log('Tarefa criada:', newTask);
    } catch (error) {
        console.error('Erro na aplicação:', error);
    }
})();
```

### TypeScript

```typescript
// Interfaces e tipos avançados
interface ApiResponse<T> {
    data: T;
    status: number;
    message?: string;
}

interface User {
    readonly id: number;
    name: string;
    email: string;
    role: 'admin' | 'user' | 'guest';
    permissions: Permission[];
    metadata?: Record<string, unknown>;
}

interface Permission {
    resource: string;
    actions: ('read' | 'write' | 'delete')[];
}

// Generic constraints e utility types
type CreateUserRequest = Omit<User, 'id' | 'permissions'> & {
    password: string;
};

type UserUpdate = Partial<Pick<User, 'name' | 'email' | 'role'>>;

// Class com generics e decorators
class ApiClient<TResponse = unknown> {
    private readonly baseUrl: string;
    private readonly defaultHeaders: Record<string, string>;
    
    constructor(baseUrl: string, apiKey?: string) {
        this.baseUrl = baseUrl;
        this.defaultHeaders = {
            'Content-Type': 'application/json',
            ...(apiKey && { 'Authorization': `Bearer ${apiKey}` })
        };
    }
    
    // Método genérico com constraints
    async request<T extends TResponse>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        const url = `${this.baseUrl}${endpoint}`;
        const config: RequestInit = {
            ...options,
            headers: {
                ...this.defaultHeaders,
                ...options.headers
            }
        };
        
        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json() as T;
            
            return {
                data,
                status: response.status,
                message: 'Success'
            };
        } catch (error) {
            console.error(`API Error [${endpoint}]:`, error);
            throw error;
        }
    }
    
    // Métodos específicos com tipos
    async getUser(userId: number): Promise<User> {
        const response = await this.request<User>(`/users/${userId}`);
        return response.data;
    }
    
    async createUser(userData: CreateUserRequest): Promise<User> {
        const response = await this.request<User>('/users', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
        return response.data;
    }
    
    async updateUser(userId: number, updates: UserUpdate): Promise<User> {
        const response = await this.request<User>(`/users/${userId}`, {
            method: 'PATCH',
            body: JSON.stringify(updates)
        });
        return response.data;
    }
}

// Enum e namespace
enum HttpStatus {
    OK = 200,
    CREATED = 201,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    NOT_FOUND = 404,
    INTERNAL_SERVER_ERROR = 500
}

namespace UserUtils {
    export function hasPermission(user: User, resource: string, action: string): boolean {
        return user.permissions.some(permission => 
            permission.resource === resource && 
            permission.actions.includes(action as any)
        );
    }
    
    export function isAdmin(user: User): user is User & { role: 'admin' } {
        return user.role === 'admin';
    }
}

// Uso com tipos inferidos
const userApi = new ApiClient<User>('https://api.example.com', 'my-api-key');

async function example() {
    try {
        const user = await userApi.getUser(123);
        
        if (UserUtils.isAdmin(user)) {
            console.log('Usuário é administrador');
        }
        
        const canRead = UserUtils.hasPermission(user, 'posts', 'read');
        console.log('Pode ler posts:', canRead);
        
    } catch (error) {
        console.error('Erro:', error);
    }
}
```

### SQL

```sql
-- Exemplo avançado de SQL com CTEs, Window Functions e Procedures
WITH monthly_sales AS (
    SELECT 
        p.product_id,
        p.product_name,
        p.category_id,
        c.category_name,
        DATE_TRUNC('month', s.sale_date) AS sale_month,
        SUM(s.quantity * s.unit_price) AS total_revenue,
        SUM(s.quantity) AS total_quantity,
        COUNT(DISTINCT s.customer_id) AS unique_customers
    FROM sales s
    INNER JOIN products p ON s.product_id = p.product_id
    INNER JOIN categories c ON p.category_id = c.category_id
    WHERE s.sale_date >= '2024-01-01'
        AND s.sale_date < '2025-01-01'
        AND s.status = 'completed'
    GROUP BY p.product_id, p.product_name, p.category_id, c.category_name, 
             DATE_TRUNC('month', s.sale_date)
),
ranked_products AS (
    SELECT 
        *,
        ROW_NUMBER() OVER (
            PARTITION BY category_id, sale_month 
            ORDER BY total_revenue DESC
        ) AS revenue_rank,
        LAG(total_revenue) OVER (
            PARTITION BY product_id 
            ORDER BY sale_month
        ) AS previous_month_revenue,
        AVG(total_revenue) OVER (
            PARTITION BY product_id 
            ORDER BY sale_month 
            ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
        ) AS rolling_avg_revenue
    FROM monthly_sales
)
SELECT 
    rp.product_name,
    rp.category_name,
    rp.sale_month,
    rp.total_revenue,
    rp.total_quantity,
    rp.unique_customers,
    rp.revenue_rank,
    COALESCE(rp.previous_month_revenue, 0) AS previous_month_revenue,
    ROUND(
        CASE 
            WHEN rp.previous_month_revenue > 0 THEN
                ((rp.total_revenue - rp.previous_month_revenue) / rp.previous_month_revenue) * 100
            ELSE NULL
        END, 2
    ) AS revenue_growth_percent,
    ROUND(rp.rolling_avg_revenue, 2) AS rolling_avg_revenue,
    CASE 
        WHEN rp.revenue_rank <= 3 THEN 'Top Performer'
        WHEN rp.revenue_rank <= 10 THEN 'Good Performer'
        ELSE 'Standard'
    END AS performance_tier
FROM ranked_products rp
WHERE rp.revenue_rank <= 20  -- Top 20 products per category per month
ORDER BY rp.category_name, rp.sale_month DESC, rp.revenue_rank;

-- Procedure para atualizar estatísticas de produtos
CREATE OR REPLACE PROCEDURE update_product_statistics()
LANGUAGE plpgsql
AS $$
DECLARE
    rec RECORD;
    updated_count INTEGER := 0;
BEGIN
    -- Log início do processo
    INSERT INTO process_log (process_name, status, started_at)
    VALUES ('update_product_statistics', 'STARTED', NOW());
    
    -- Cursor para iterar produtos
    FOR rec IN 
        SELECT p.product_id, 
               COUNT(s.sale_id) as total_sales,
               SUM(s.quantity) as total_quantity_sold,
               AVG(s.unit_price) as avg_price,
               MAX(s.sale_date) as last_sale_date
        FROM products p
        LEFT JOIN sales s ON p.product_id = s.product_id
        WHERE p.is_active = true
        GROUP BY p.product_id
    LOOP
        -- Atualizar estatísticas do produto
        UPDATE products 
        SET 
            total_sales = rec.total_sales,
            total_quantity_sold = rec.total_quantity_sold,
            avg_sale_price = rec.avg_price,
            last_sale_date = rec.last_sale_date,
            updated_at = NOW()
        WHERE product_id = rec.product_id;
        
        updated_count := updated_count + 1;
    END LOOP;
    
    -- Log fim do processo
    UPDATE process_log 
    SET status = 'COMPLETED', 
        completed_at = NOW(),
        records_processed = updated_count
    WHERE process_name = 'update_product_statistics' 
        AND status = 'STARTED';
    
    RAISE NOTICE 'Processo concluído. % produtos atualizados.', updated_count;
    
EXCEPTION
    WHEN OTHERS THEN
        -- Log erro
        UPDATE process_log 
        SET status = 'FAILED', 
            completed_at = NOW(),
            error_message = SQLERRM
        WHERE process_name = 'update_product_statistics' 
            AND status = 'STARTED';
        
        RAISE EXCEPTION 'Erro ao atualizar estatísticas: %', SQLERRM;
END;
$$;
```

### PHP

```php
<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\User;
use App\Interfaces\UserRepositoryInterface;
use App\Exceptions\UserNotFoundException;
use App\Events\UserCreated;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\{Hash, Event, Cache, Log};

/**
 * Serviço para gerenciamento de usuários
 * 
 * @package App\Services
 */
class UserService
{
    private UserRepositoryInterface $userRepository;
    private const CACHE_TTL = 3600; // 1 hora
    
    public function __construct(UserRepositoryInterface $userRepository)
    {
        $this->userRepository = $userRepository;
    }
    
    /**
     * Cria um novo usuário no sistema
     *
     * @param array $userData Dados do usuário
     * @return User
     * @throws \InvalidArgumentException
     */
    public function createUser(array $userData): User
    {
        // Validação dos dados
        $this->validateUserData($userData);
        
        // Hash da senha
        if (isset($userData['password'])) {
            $userData['password'] = Hash::make($userData['password']);
        }
        
        // Criar usuário
        $user = $this->userRepository->create($userData);
        
        // Limpar cache relacionado
        $this->clearUserCache($user->email);
        
        // Disparar evento
        Event::dispatch(new UserCreated($user));
        
        Log::info('Usuário criado com sucesso', [
            'user_id' => $user->id,
            'email' => $user->email
        ]);
        
        return $user;
    }
    
    /**
     * Busca usuários com filtros e paginação
     *
     * @param array $filters Filtros de busca
     * @param int $perPage Itens por página
     * @return Collection
     */
    public function searchUsers(array $filters = [], int $perPage = 20): Collection
    {
        $cacheKey = 'users_search_' . md5(serialize($filters) . $perPage);
        
        return Cache::remember($cacheKey, self::CACHE_TTL, function () use ($filters, $perPage) {
            $query = $this->userRepository->query();
            
            // Aplicar filtros
            if (!empty($filters['name'])) {
                $query->where('name', 'LIKE', "%{$filters['name']}%");
            }
            
            if (!empty($filters['email'])) {
                $query->where('email', 'LIKE', "%{$filters['email']}%");
            }
            
            if (isset($filters['active'])) {
                $query->where('active', (bool) $filters['active']);
            }
            
            if (!empty($filters['role'])) {
                $query->whereIn('role', (array) $filters['role']);
            }
            
            // Aplicar ordenação
            $orderBy = $filters['order_by'] ?? 'created_at';
            $orderDirection = $filters['order_direction'] ?? 'desc';
            $query->orderBy($orderBy, $orderDirection);
            
            return $query->paginate($perPage);
        });
    }
    
    /**
     * Atualiza um usuário existente
     *
     * @param int $userId ID do usuário
     * @param array $userData Dados para atualização
     * @return User
     * @throws UserNotFoundException
     */
    public function updateUser(int $userId, array $userData): User
    {
        $user = $this->findUserById($userId);
        
        // Validar dados de atualização
        $this->validateUserData($userData, true);
        
        // Hash da nova senha se fornecida
        if (isset($userData['password'])) {
            $userData['password'] = Hash::make($userData['password']);
        }
        
        // Atualizar usuário
        $updatedUser = $this->userRepository->update($user, $userData);
        
        // Limpar cache
        $this->clearUserCache($user->email);
        
        Log::info('Usuário atualizado', [
            'user_id' => $userId,
            'updated_fields' => array_keys($userData)
        ]);
        
        return $updatedUser;
    }
    
    /**
     * Busca usuário por ID
     *
     * @param int $userId
     * @return User
     * @throws UserNotFoundException
     */
    public function findUserById(int $userId): User
    {
        $user = Cache::remember("user_{$userId}", self::CACHE_TTL, function () use ($userId) {
            return $this->userRepository->findById($userId);
        });
        
        if (!$user) {
            throw new UserNotFoundException("Usuário com ID {$userId} não encontrado");
        }
        
        return $user;
    }
    
    /**
     * Busca usuário por email
     *
     * @param string $email
     * @return User|null
     */
    public function findUserByEmail(string $email): ?User
    {
        return Cache::remember("user_email_{$email}", self::CACHE_TTL, function () use ($email) {
            return $this->userRepository->findByEmail($email);
        });
    }
    
    /**
     * Valida dados do usuário
     *
     * @param array $userData
     * @param bool $isUpdate
     * @throws \InvalidArgumentException
     */
    private function validateUserData(array $userData, bool $isUpdate = false): void
    {
        $required = $isUpdate ? [] : ['name', 'email'];
        
        foreach ($required as $field) {
            if (empty($userData[$field])) {
                throw new \InvalidArgumentException("Campo obrigatório: {$field}");
            }
        }
        
        if (isset($userData['email']) && !filter_var($userData['email'], FILTER_VALIDATE_EMAIL)) {
            throw new \InvalidArgumentException('Email inválido');
        }
        
        if (isset($userData['password']) && strlen($userData['password']) < 6) {
            throw new \InvalidArgumentException('Senha deve ter pelo menos 6 caracteres');
        }
    }
    
    /**
     * Limpa cache relacionado ao usuário
     *
     * @param string $email
     */
    private function clearUserCache(string $email): void
    {
        Cache::forget("user_email_{$email}");
        // Limpar outros caches relacionados conforme necessário
        Cache::tags(['users'])->flush();
    }
}
```

### C#

```csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Caching.Memory;

namespace App.Services
{
    /// <summary>
    /// Serviço para gerenciamento de produtos com cache e logging
    /// </summary>
    public class ProductService : IProductService
    {
        private readonly IProductRepository _productRepository;
        private readonly IMemoryCache _cache;
        private readonly ILogger<ProductService> _logger;
        private const int CacheDurationMinutes = 30;
        
        public ProductService(
            IProductRepository productRepository,
            IMemoryCache cache,
            ILogger<ProductService> logger)
        {
            _productRepository = productRepository ?? throw new ArgumentNullException(nameof(productRepository));
            _cache = cache ?? throw new ArgumentNullException(nameof(cache));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }
        
        /// <summary>
        /// Busca produtos com filtros e paginação
        /// </summary>
        /// <param name="filters">Filtros de busca</param>
        /// <param name="pageNumber">Número da página</param>
        /// <param name="pageSize">Tamanho da página</param>
        /// <returns>Lista paginada de produtos</returns>
        public async Task<PagedResult<Product>> SearchProductsAsync(
            ProductFilters filters, 
            int pageNumber = 1, 
            int pageSize = 20)
        {
            try
            {
                var cacheKey = $"products_search_{filters.GetHashCode()}_{pageNumber}_{pageSize}";
                
                if (_cache.TryGetValue(cacheKey, out PagedResult<Product> cachedResult))
                {
                    _logger.LogDebug("Retornando produtos do cache: {CacheKey}", cacheKey);
                    return cachedResult;
                }
                
                var query = _productRepository.GetQueryable();
                
                // Aplicar filtros
                query = ApplyFilters(query, filters);
                
                // Contar total de registros
                var totalCount = await query.CountAsync();
                
                // Aplicar paginação
                var products = await query
                    .OrderBy(p => p.Name)
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .Select(p => new Product
                    {
                        Id = p.Id,
                        Name = p.Name,
                        Description = p.Description,
                        Price = p.Price,
                        CategoryId = p.CategoryId,
                        Category = new Category { Id = p.Category.Id, Name = p.Category.Name },
                        IsActive = p.IsActive,
                        CreatedAt = p.CreatedAt,
                        UpdatedAt = p.UpdatedAt
                    })
                    .ToListAsync();
                
                var result = new PagedResult<Product>
                {
                    Items = products,
                    TotalCount = totalCount,
                    PageNumber = pageNumber,
                    PageSize = pageSize,
                    TotalPages = (int)Math.Ceiling((double)totalCount / pageSize)
                };
                
                // Cache por 30 minutos
                _cache.Set(cacheKey, result, TimeSpan.FromMinutes(CacheDurationMinutes));
                
                _logger.LogInformation("Busca de produtos realizada: {Count} produtos encontrados", products.Count);
                
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao buscar produtos com filtros: {@Filters}", filters);
                throw;
            }
        }
        
        /// <summary>
        /// Cria um novo produto
        /// </summary>
        /// <param name="productDto">Dados do produto</param>
        /// <returns>Produto criado</returns>
        public async Task<Product> CreateProductAsync(CreateProductDto productDto)
        {
            if (productDto == null)
                throw new ArgumentNullException(nameof(productDto));
                
            try
            {
                // Validar dados
                await ValidateProductDataAsync(productDto);
                
                var product = new Product
                {
                    Name = productDto.Name.Trim(),
                    Description = productDto.Description?.Trim(),
                    Price = productDto.Price,
                    CategoryId = productDto.CategoryId,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                
                var createdProduct = await _productRepository.CreateAsync(product);
                
                // Limpar cache relacionado
                ClearProductCache();
                
                _logger.LogInformation("Produto criado com sucesso: {ProductId} - {ProductName}", 
                    createdProduct.Id, createdProduct.Name);
                
                return createdProduct;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao criar produto: {@ProductDto}", productDto);
                throw;
            }
        }
        
        /// <summary>
        /// Atualiza um produto existente
        /// </summary>
        /// <param name="productId">ID do produto</param>
        /// <param name="productDto">Dados para atualização</param>
        /// <returns>Produto atualizado</returns>
        public async Task<Product> UpdateProductAsync(int productId, UpdateProductDto productDto)
        {
            if (productDto == null)
                throw new ArgumentNullException(nameof(productDto));
                
            try
            {
                var existingProduct = await _productRepository.GetByIdAsync(productId);
                if (existingProduct == null)
                {
                    throw new NotFoundException($"Produto com ID {productId} não encontrado");
                }
                
                // Validar dados de atualização
                await ValidateProductUpdateDataAsync(productDto, productId);
                
                // Atualizar propriedades
                existingProduct.Name = productDto.Name?.Trim() ?? existingProduct.Name;
                existingProduct.Description = productDto.Description?.Trim() ?? existingProduct.Description;
                existingProduct.Price = productDto.Price ?? existingProduct.Price;
                existingProduct.CategoryId = productDto.CategoryId ?? existingProduct.CategoryId;
                existingProduct.IsActive = productDto.IsActive ?? existingProduct.IsActive;
                existingProduct.UpdatedAt = DateTime.UtcNow;
                
                var updatedProduct = await _productRepository.UpdateAsync(existingProduct);
                
                // Limpar cache
                ClearProductCache();
                
                _logger.LogInformation("Produto atualizado: {ProductId} - {ProductName}", 
                    updatedProduct.Id, updatedProduct.Name);
                
                return updatedProduct;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao atualizar produto {ProductId}: {@ProductDto}", 
                    productId, productDto);
                throw;
            }
        }
        
        /// <summary>
        /// Aplica filtros à query de produtos
        /// </summary>
        private static IQueryable<Product> ApplyFilters(IQueryable<Product> query, ProductFilters filters)
        {
            if (!string.IsNullOrWhiteSpace(filters.Name))
            {
                query = query.Where(p => p.Name.Contains(filters.Name));
            }
            
            if (filters.CategoryIds?.Any() == true)
            {
                query = query.Where(p => filters.CategoryIds.Contains(p.CategoryId));
            }
            
            if (filters.MinPrice.HasValue)
            {
                query = query.Where(p => p.Price >= filters.MinPrice.Value);
            }
            
            if (filters.MaxPrice.HasValue)
            {
                query = query.Where(p => p.Price <= filters.MaxPrice.Value);
            }
            
            if (filters.IsActive.HasValue)
            {
                query = query.Where(p => p.IsActive == filters.IsActive.Value);
            }
            
            return query;
        }
        
        /// <summary>
        /// Valida dados do produto
        /// </summary>
        private async Task ValidateProductDataAsync(CreateProductDto productDto)
        {
            if (string.IsNullOrWhiteSpace(productDto.Name))
                throw new ValidationException("Nome do produto é obrigatório");
                
            if (productDto.Price <= 0)
                throw new ValidationException("Preço deve ser maior que zero");
                
            // Verificar se categoria existe
            var categoryExists = await _productRepository.CategoryExistsAsync(productDto.CategoryId);
            if (!categoryExists)
                throw new ValidationException($"Categoria com ID {productDto.CategoryId} não existe");
                
            // Verificar se já existe produto com mesmo nome
            var existingProduct = await _productRepository.GetByNameAsync(productDto.Name);
            if (existingProduct != null)
                throw new ValidationException($"Já existe um produto com o nome '{productDto.Name}'");
        }
        
        /// <summary>
        /// Limpa cache de produtos
        /// </summary>
        private void ClearProductCache()
        {
            // Implementar lógica para limpar cache baseado em tags ou padrões
            _logger.LogDebug("Cache de produtos limpo");
        }
    }
    
    // Classes de apoio
    public class PagedResult<T>
    {
        public List<T> Items { get; set; } = new();
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
        public bool HasPreviousPage => PageNumber > 1;
        public bool HasNextPage => PageNumber < TotalPages;
    }
    
    public class ProductFilters
    {
        public string? Name { get; set; }
        public List<int>? CategoryIds { get; set; }
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
        public bool? IsActive { get; set; }
        
        public override int GetHashCode()
        {
            return HashCode.Combine(Name, CategoryIds, MinPrice, MaxPrice, IsActive);
        }
    }
}
```

## 🌐 Linguagens de Marcação e Configuração

### XML

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration xmlns="http://example.com/config" 
               xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
               xsi:schemaLocation="http://example.com/config config.xsd">
    
    <!-- Configuração da aplicação -->
    <application name="confluence-smart-publisher" version="0.4.1">
        <settings>
            <database>
                <connection-string>Server=localhost;Database=mydb;Trusted_Connection=true;</connection-string>
                <timeout>30</timeout>
                <max-pool-size>100</max-pool-size>
            </database>
            
            <logging level="Info">
                <appenders>
                    <appender type="file" path="logs/app.log" />
                    <appender type="console" format="json" />
                </appenders>
            </logging>
            
            <features>
                <feature name="syntax-highlighting" enabled="true" />
                <feature name="commonmark-compliance" enabled="true" />
                <feature name="material-design" enabled="true" />
            </features>
        </settings>
    </application>
</configuration>
```

### JSON

```json
{
  "name": "confluence-smart-publisher",
  "version": "0.4.1",
  "description": "VS Code extension for Confluence integration with syntax highlighting",
  "author": {
    "name": "Antonio Carelli",
    "email": "author@example.com"
  },
  "engines": {
    "vscode": "^1.96.0",
    "node": ">=18.0.0"
  },
  "categories": [
    "Other",
    "Formatters",
    "Language Packs"
  ],
  "keywords": [
    "confluence",
    "markdown",
    "commonmark",
    "syntax-highlighting",
    "material-design"
  ],
  "contributes": {
    "commands": [
      {
        "command": "confluence-smart-publisher.preview",
        "title": "Open Markdown Preview",
        "category": "Confluence Smart Publisher",
        "icon": {
          "light": "images/preview-light.svg",
          "dark": "images/preview-dark.svg"
        }
      }
    ],
    "languages": [
      {
        "id": "confluence",
        "aliases": ["Confluence", "confluence"],
        "extensions": [".confluence"],
        "configuration": "./language-configuration/confluence.json"
      }
    ],
    "configuration": {
      "title": "Confluence Smart Publisher",
      "properties": {
        "confluenceSmartPublisher.syntaxHighlighting": {
          "type": "boolean",
          "default": true,
          "description": "Enable syntax highlighting in preview"
        },
        "confluenceSmartPublisher.theme": {
          "type": "string",
          "enum": ["dark", "light", "auto"],
          "default": "auto",
          "description": "Preview theme"
        }
      }
    }
  },
  "dependencies": {
    "highlight.js": "^11.9.0",
    "markdown-it": "^14.1.0",
    "markdown-it-admonition": "^1.0.4"
  },
  "devDependencies": {
    "@types/highlight.js": "^10.1.0",
    "typescript": "^5.3.3",
    "webpack": "^5.89.0"
  },
  "scripts": {
    "build": "webpack --mode production",
    "watch": "webpack --watch",
    "test": "npm run test:unit && npm run test:integration",
    "test:unit": "jest --testMatch='**/*.test.ts'",
    "test:integration": "jest --testMatch='**/*.integration.test.ts'"
  }
}
```

### YAML

```yaml
# Configuração de CI/CD para GitHub Actions
name: Build and Test

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '18'
  VSCODE_VERSION: '1.96.0'

jobs:
  test:
    name: Run Tests
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [16, 18, 20]
        os: [ubuntu-latest, windows-latest, macos-latest]
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      
      - name: Install dependencies
        run: |
          npm ci
          npm run compile
      
      - name: Run linting
        run: npm run lint
      
      - name: Run unit tests
        run: npm run test:unit
        env:
          CI: true
      
      - name: Run integration tests
        run: npm run test:integration
        if: matrix.os == 'ubuntu-latest'
      
      - name: Build extension
        run: npm run package
      
      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        if: matrix.os == 'ubuntu-latest' && matrix.node-version == '18'
        with:
          file: ./coverage/lcov.info
          flags: unittests
          name: codecov-umbrella

  build:
    name: Build Extension
    runs-on: ubuntu-latest
    needs: test
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Package extension
        run: |
          npm install -g @vscode/vsce
          vsce package
      
      - name: Upload artifact
        uses: actions/upload-artifact@v3
        with:
          name: extension-package
          path: '*.vsix'

  release:
    name: Release
    runs-on: ubuntu-latest
    needs: [test, build]
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Download artifacts
        uses: actions/download-artifact@v3
        with:
          name: extension-package
      
      - name: Create Release
        uses: softprops/action-gh-release@v1
        if: startsWith(github.ref, 'refs/tags/')
        with:
          files: '*.vsix'
          generate_release_notes: true
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## 🚀 Demonstração

Este arquivo de teste demonstra o suporte completo a syntax highlighting para:

- ✅ **Java** - Classes, métodos, streams, lambdas
- ✅ **Python** - Async/await, type hints, dataclasses
- ✅ **JavaScript** - ES6+, async/await, destructuring
- ✅ **TypeScript** - Generics, interfaces, decorators
- ✅ **SQL** - CTEs, window functions, procedures
- ✅ **PHP** - Classes, namespaces, traits
- ✅ **C#** - LINQ, async/await, dependency injection
- ✅ **XML** - Schemas, namespaces, configurações
- ✅ **JSON** - Configurações estruturadas
- ✅ **YAML** - CI/CD, configurações

O sistema detecta automaticamente a linguagem e aplica o highlighting apropriado, com fallback para detecção automática quando necessário.