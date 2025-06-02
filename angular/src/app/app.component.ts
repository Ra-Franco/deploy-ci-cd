import { Component, Input } from '@angular/core';
import { Tarefa } from './model/tarefa';
import { AppService } from './app.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  listaTarefas: Tarefa[] = [];
  novaDescricao!: string;
  tarefaEditando: Tarefa | null = null;
  descricaoEditando: string = '';

  constructor(private service: AppService) {

  }

  ngOnInit(){
    this.onRefresh();
  };

  onRefresh(){
    this.service.getTarefas().subscribe((tarefas: any) => {
      this.listaTarefas = tarefas;
    },
    (error: any) => console.error('Erro ao carregar tarefas:', error));
  }

  adicionarTarefa() {
    if (this.novaDescricao && this.novaDescricao.trim() !== '') {
      const novaTarefa: Tarefa = {
        // id será atribuído pelo backend
        descricao: this.novaDescricao,
        concluida: false
      } as Tarefa;
      this.service.addTarefa(novaTarefa).subscribe(() => {
        this.onRefresh();
        this.novaDescricao = '';
      });
    }
  }

  concluirDesconcluirTarefa(tarefa: Tarefa) {
    const tarefaAtualizada = { ...tarefa, concluida: !tarefa.concluida };
    this.service.updateTarefa(tarefaAtualizada).subscribe(() => {
      this.onRefresh();
    });
  }

  removerTarefa(tarefa: Tarefa) {
    this.service.deleteTarefa(tarefa.id).subscribe(() => {
      this.onRefresh();
    });
  }

  editarTarefa(tarefa: Tarefa) {
    this.tarefaEditando = tarefa;
    this.descricaoEditando = tarefa.descricao;
  }

  salvarEdicaoTarefa() {
    if (this.tarefaEditando && this.descricaoEditando.trim() !== '') {
      const tarefaAtualizada = { ...this.tarefaEditando, descricao: this.descricaoEditando };
      this.service.updateTarefa(tarefaAtualizada).subscribe(() => {
        this.onRefresh();
        this.tarefaEditando = null;
        this.descricaoEditando = '';
      });
    }
  }

  cancelarEdicaoTarefa() {
    this.tarefaEditando = null;
    this.descricaoEditando = '';
  }

  labelConcluir(concluida: boolean): string {
    return concluida ? 'Desconcluir' : 'Concluir';
  }
}
