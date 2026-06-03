# React 开发实战指南

React 是 Facebook 推出的用于构建用户界面的 JavaScript 库。它通过组件化、声明式编程和虚拟 DOM 等理念，彻底改变了前端开发的方式。本文将深入探讨 React 的核心概念和实战技巧。

## JSX：JavaScript 的语法扩展

JSX 是 React 的核心语法，它允许你在 JavaScript 中编写类似 HTML 的代码。

**JSX 基础**

```jsx
// JSX 会被编译为 React.createElement 调用
const element = <h1>Hello, world!</h1>

// 编译后
const element = React.createElement('h1', null, 'Hello, world!')

// 表达式嵌入
const name = '张三'
const greeting = <h1>你好，{name}！</h1>

// 条件渲染
const isLoggedIn = true
const element = isLoggedIn ? <UserPanel /> : <LoginForm />

// 列表渲染
const items = ['苹果', '香蕉', '橙子']
const list = (
  <ul>
    {items.map((item, index) => (
      <li key={index}>{item}</li>
    ))}
  </ul>
)
```

**JSX 的安全特性**

```jsx
// 自动转义，防止 XSS 攻击
const userInput = '<script>alert("xss")</script>'
const element = <div>{userInput}</div>
// 输出: <div>&lt;script&gt;alert("xss")&lt;/script&gt;</div>

// 危险地设置 innerHTML（谨慎使用）
const htmlContent = '<strong>加粗文本</strong>'
const element = <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
```

## 组件：React 的核心单元

React 应用由组件构成，组件是独立、可复用的代码片段。

**函数组件**

```jsx
// 简单的函数组件
function Welcome(props) {
  return <h1>你好，{props.name}</h1>
}

// 箭头函数组件
const Welcome = (props) => {
  return <h1>你好，{props.name}</h1>
}

// 解构赋值
const Welcome = ({ name, age }) => {
  return (
    <div>
      <h1>你好，{name}</h1>
      <p>年龄：{age}</p>
    </div>
  )
}
```

**类组件（旧版，了解即可）**

```jsx
class Welcome extends React.Component {
  constructor(props) {
    super(props)
    this.state = { count: 0 }
  }
  
  render() {
    return (
      <div>
        <h1>你好，{this.props.name}</h1>
        <p>计数：{this.state.count}</p>
        <button onClick={() => this.setState({ count: this.state.count + 1 })}>
          增加
        </button>
      </div>
    )
  }
}
```

## Hooks：函数组件的利器

Hooks 是 React 16.8 引入的特性，让函数组件拥有了状态和生命周期等能力。

**useState：状态管理**

```jsx
import { useState } from 'react'

function Counter() {
  // 声明状态变量
  const [count, setCount] = useState(0)
  
  // 更新状态
  const increment = () => {
    setCount(count + 1)
    // 或者使用函数式更新（推荐）
    setCount(prev => prev + 1)
  }
  
  // 惰性初始化
  const [complexState, setComplexState] = useState(() => {
    return computeExpensiveValue()
  })
  
  return (
    <div>
      <p>计数：{count}</p>
      <button onClick={increment}>增加</button>
    </div>
  )
}
```

**useEffect：副作用处理**

```jsx
import { useState, useEffect } from 'react'

function UserProfile({ userId }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    // 副作用函数
    const fetchUser = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/users/${userId}`)
        const data = await response.json()
        setUser(data)
      } catch (error) {
        console.error('获取用户失败:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchUser()
  }, [userId]) // 依赖数组：当 userId 变化时重新执行
  
  // 清理函数
  useEffect(() => {
    const timer = setInterval(() => {
      console.log('定时器执行')
    }, 1000)
    
    return () => {
      // 组件卸载时清理
      clearInterval(timer)
    }
  }, []) // 空依赖数组：只在挂载和卸载时执行
  
  if (loading) return <div>加载中...</div>
  if (!user) return <div>用户不存在</div>
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  )
}
```

**useContext：上下文共享**

```jsx
import { createContext, useContext, useState } from 'react'

// 创建上下文
const ThemeContext = createContext('light')

// 提供者组件
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light')
  
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

// 消费者组件
function ThemedButton() {
  const { theme, toggleTheme } = useContext(ThemeContext)
  
  return (
    <button 
      onClick={toggleTheme}
      style={{ 
        background: theme === 'light' ? '#fff' : '#333',
        color: theme === 'light' ? '#333' : '#fff'
      }}
    >
      切换主题
    </button>
  )
}
```

**useReducer：复杂状态逻辑**

```jsx
import { useReducer } from 'react'

// 定义 reducer
function todoReducer(state, action) {
  switch (action.type) {
    case 'ADD_TODO':
      return {
        ...state,
        todos: [...state.todos, {
          id: Date.now(),
          text: action.payload,
          completed: false
        }]
      }
    case 'TOGGLE_TODO':
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload
            ? { ...todo, completed: !todo.completed }
            : todo
        )
      }
    case 'DELETE_TODO':
      return {
        ...state,
        todos: state.todos.filter(todo => todo.id !== action.payload)
      }
    default:
      return state
  }
}

function TodoApp() {
  const [state, dispatch] = useReducer(todoReducer, { todos: [] })
  
  const addTodo = (text) => {
    dispatch({ type: 'ADD_TODO', payload: text })
  }
  
  const toggleTodo = (id) => {
    dispatch({ type: 'TOGGLE_TODO', payload: id })
  }
  
  return (
    <div>
      <button onClick={() => addTodo('新任务')}>添加任务</button>
      <ul>
        {state.todos.map(todo => (
          <li 
            key={todo.id}
            onClick={() => toggleTodo(todo.id)}
            style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}
          >
            {todo.text}
          </li>
        ))}
      </ul>
    </div>
  )
}
```

## 性能优化

React 提供了多种性能优化工具和策略。

**React.memo**

```jsx
import { memo } from 'react'

// 只有当 props 变化时才重新渲染
const ExpensiveComponent = memo(({ data, onUpdate }) => {
  console.log('ExpensiveComponent 渲染')
  // 复杂的渲染逻辑
  return (
    <div>
      {data.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  )
})

// 自定义比较函数
const OptimizedComponent = memo(
  ({ user, theme }) => {
    return <div>{user.name}</div>
  },
  (prevProps, nextProps) => {
    // 返回 true 表示不需要重新渲染
    return prevProps.user.id === nextProps.user.id
  }
)
```

**useMemo 和 useCallback**

```jsx
import { useMemo, useCallback } from 'react'

function ProductList({ products, filter }) {
  // 缓存计算结果
  const filteredProducts = useMemo(() => {
    return products.filter(p => p.category === filter)
  }, [products, filter])
  
  // 缓存函数引用
  const handleSelect = useCallback((id) => {
    console.log('选中产品:', id)
  }, [])
  
  return (
    <div>
      {filteredProducts.map(product => (
        <ProductItem 
          key={product.id}
          product={product}
          onSelect={handleSelect}
        />
      ))}
    </div>
  )
}
```

**虚拟列表**

```jsx
import { FixedSizeList } from 'react-window'

function VirtualList({ items }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      {items[index].name}
    </div>
  )
  
  return (
    <FixedSizeList
      height={400}
      width={300}
      itemCount={items.length}
      itemSize={50}
    >
      {Row}
    </FixedSizeList>
  )
}
```

## 状态管理

对于大型应用，可能需要更强大的状态管理方案。

**Redux Toolkit**

```javascript
// store/slices/counterSlice.js
import { createSlice } from '@reduxjs/toolkit'

const counterSlice = createSlice({
  name: 'counter',
  initialState: {
    value: 0
  },
  reducers: {
    increment: (state) => {
      state.value += 1
    },
    decrement: (state) => {
      state.value -= 1
    },
    incrementByAmount: (state, action) => {
      state.value += action.payload
    }
  }
})

export const { increment, decrement, incrementByAmount } = counterSlice.actions
export default counterSlice.reducer

// store/index.js
import { configureStore } from '@reduxjs/toolkit'
import counterReducer from './slices/counterSlice'

export const store = configureStore({
  reducer: {
    counter: counterReducer
  }
})

// 在组件中使用
import { useSelector, useDispatch } from 'react-redux'
import { increment, decrement } from './store/slices/counterSlice'

function Counter() {
  const count = useSelector(state => state.counter.value)
  const dispatch = useDispatch()
  
  return (
    <div>
      <button onClick={() => dispatch(decrement())}>-</button>
      <span>{count}</span>
      <button onClick={() => dispatch(increment())}>+</button>
    </div>
  )
}
```

**Zustand（轻量级替代）**

```javascript
import { create } from 'zustand'

const useStore = create((set) => ({
  count: 0,
  increment: () => set(state => ({ count: state.count + 1 })),
  decrement: () => set(state => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 })
}))

function Counter() {
  const { count, increment, decrement } = useStore()
  
  return (
    <div>
      <button onClick={decrement}>-</button>
      <span>{count}</span>
      <button onClick={increment}>+</button>
    </div>
  )
}
```

## 路由管理

**React Router v6**

```jsx
import { BrowserRouter, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">首页</Link>
        <Link to="/about">关于</Link>
        <Link to="/users">用户</Link>
      </nav>
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/users" element={<Users />}>
          <Route path=":userId" element={<UserProfile />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

function UserProfile() {
  const { userId } = useParams()
  const navigate = useNavigate()
  
  return (
    <div>
      <h1>用户 {userId} 的资料</h1>
      <button onClick={() => navigate('/')}>返回首页</button>
    </div>
  )
}
```

## 表单处理

**受控组件**

```jsx
import { useState } from 'react'

function LoginForm() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [errors, setErrors] = useState({})
  
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // 清除错误
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }
  
  const validate = () => {
    const newErrors = {}
    if (!formData.username) {
      newErrors.username = '用户名不能为空'
    }
    if (formData.password.length < 6) {
      newErrors.password = '密码至少6位'
    }
    return newErrors
  }
  
  const handleSubmit = (e) => {
    e.preventDefault()
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    // 提交表单
    console.log('提交:', formData)
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="用户名"
        />
        {errors.username && <span className="error">{errors.username}</span>}
      </div>
      <div>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="密码"
        />
        {errors.password && <span className="error">{errors.password}</span>}
      </div>
      <button type="submit">登录</button>
    </form>
  )
}
```

**React Hook Form**

```jsx
import { useForm } from 'react-hook-form'

function AdvancedForm() {
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting } 
  } = useForm()
  
  const onSubmit = async (data) => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log('提交:', data)
  }
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register('username', { 
          required: '用户名不能为空',
          minLength: { value: 3, message: '至少3个字符' }
        })}
        placeholder="用户名"
      />
      {errors.username && <span>{errors.username.message}</span>}
      
      <input
        type="password"
        {...register('password', { 
          required: '密码不能为空',
          pattern: { 
            value: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
            message: '密码需要包含字母和数字'
          }
        })}
        placeholder="密码"
      />
      {errors.password && <span>{errors.password.message}</span>}
      
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? '提交中...' : '登录'}
      </button>
    </form>
  )
}
```

## 测试

**Jest + React Testing Library**

```jsx
// Counter.test.jsx
import { render, screen, fireEvent } from '@testing-library/react'
import Counter from './Counter'

describe('Counter 组件', () => {
  test('渲染初始计数', () => {
    render(<Counter initialCount={0} />)
    expect(screen.getByText('计数: 0')).toBeInTheDocument()
  })
  
  test('点击增加按钮更新计数', () => {
    render(<Counter initialCount={0} />)
    const incrementButton = screen.getByText('增加')
    
    fireEvent.click(incrementButton)
    
    expect(screen.getByText('计数: 1')).toBeInTheDocument()
  })
  
  test('点击减少按钮更新计数', () => {
    render(<Counter initialCount={5} />)
    const decrementButton = screen.getByText('减少')
    
    fireEvent.click(decrementButton)
    
    expect(screen.getByText('计数: 4')).toBeInTheDocument()
  })
})
```

## 实战：构建一个完整的博客应用

让我们通过一个博客应用来综合运用 React 的核心概念：

```jsx
// App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import PostDetail from './pages/PostDetail'
import CreatePost from './pages/CreatePost'
import Login from './pages/Login'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/post/:id" element={<PostDetail />} />
              <Route path="/create" element={<CreatePost />} />
              <Route path="/login" element={<Login />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

// hooks/usePosts.js
import { useQuery, useMutation, useQueryClient } from 'react-query'

export function usePosts() {
  return useQuery('posts', async () => {
    const response = await fetch('/api/posts')
    return response.json()
  })
}

export function useCreatePost() {
  const queryClient = useQueryClient()
  
  return useMutation(
    async (newPost) => {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPost)
      })
      return response.json()
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('posts')
      }
    }
  )
}

// pages/Home.jsx
import { usePosts } from '../hooks/usePosts'
import PostCard from '../components/PostCard'

function Home() {
  const { data: posts, isLoading, error } = usePosts()
  
  if (isLoading) return <div>加载中...</div>
  if (error) return <div>加载失败: {error.message}</div>
  
  return (
    <div className="home">
      <h1>最新文章</h1>
      <div className="post-list">
        {posts.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  )
}
```

## 总结

React 以其组件化、声明式编程的理念，成为了前端开发的主流选择之一。掌握 JSX、Hooks、状态管理、路由等核心概念，能够帮助你构建高质量的前端应用。

React 生态系统非常丰富，有大量优秀的第三方库可供选择。但记住，理解核心概念比学习特定库更重要。当你深入理解了 React 的设计思想，学习新的库和工具也会变得容易许多。持续实践，不断探索，你的 React 技能会越来越精进。