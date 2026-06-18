import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Perfil } from './pages/perfil/perfil';
import { Cadastro } from './pages/cadastro/cadastro';
import { Dashboard } from './pages/dashboard/dashboard';
import { Home } from './pages/home/home';
import { DashboardGerente } from './pages/dashboard-gerente/dashboard-gerente';
import { Investimento } from './pages/investimento/investimento';
import { Deposito } from './pages/deposito/deposito';
import { Saque } from './pages/saque/saque';
import { Transferencia } from './pages/transferencia/transferencia';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'investimento', component: Investimento },
  { path: 'home', component: Home },
  { path: 'login', component: Login },
  { path: 'cadastro', component: Cadastro },
  { path: 'perfil', component: Perfil },
  { path: 'dashboard', component: Dashboard },
  { path: 'dashboard-gerente', component: DashboardGerente },
  { path: 'deposito', component: Deposito },
  { path: 'saque', component: Saque },
  { path: 'transferencia', component: Transferencia }, 
  
  { path: '**', redirectTo: '' }
];