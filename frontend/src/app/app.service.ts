import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from './enviroments';
import { take } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  constructor(private http: HttpClient) { }

  getTarefas() {
    return this.http.get(`${environment.apiUrl}/tarefas`).pipe(take(1));
  }

   addTarefa(tarefa: any) {
    return this.http.post(`${environment.apiUrl}/tarefas`, tarefa).pipe(take(1));
 }

 updateTarefa(tarefa: any) {
    return this.http.put(`${environment.apiUrl}/tarefas/${tarefa.id}`, tarefa).pipe(take(1));
  }

  deleteTarefa(id: number) {
    return this.http.delete(`${environment.apiUrl}/tarefas/${id}`).pipe(take(1));
  }
}
