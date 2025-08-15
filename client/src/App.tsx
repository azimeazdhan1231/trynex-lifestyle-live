import { Route, Switch } from "wouter";
import { Suspense, lazy } from "react";

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/PerfectHomePage'));
const Products = lazy(() => import('./pages/products'));
const Product = lazy(() => import('./pages/product'));
const About = lazy(() => import('./pages/about'));
const Contact = lazy(() => import('./pages/contact'));
const Cart = lazy(() => import('./pages/cart'));
const Checkout = lazy(() => import('./pages/checkout'));
const Orders = lazy(() => import('./pages/orders'));
const Profile = lazy(() => import('./pages/profile'));
const Auth = lazy(() => import('./pages/auth'));
const Admin = lazy(() => import('./pages/admin'));
const NotFound = lazy(() => import('./pages/not-found'));

function AppContent() {
  console.log('🔍 AppContent is rendering!');
  
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#00ff00' }}>
      <Suspense fallback={
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#ffff00',
          color: 'black',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '32px'
        }}>
          🟡 LOADING...
        </div>
      }>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/products" component={Products} />
          <Route path="/product/:id" component={Product} />
          <Route path="/about" component={About} />
          <Route path="/contact" component={Contact} />
          <Route path="/cart" component={Cart} />
          <Route path="/checkout" component={Checkout} />
          <Route path="/orders" component={Orders} />
          <Route path="/profile" component={Profile} />
          <Route path="/auth" component={Auth} />
          <Route path="/admin" component={Admin} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </div>
  );
}

export default function App() {
  console.log('🔍 App component is rendering!');
  
  return <AppContent />;
}