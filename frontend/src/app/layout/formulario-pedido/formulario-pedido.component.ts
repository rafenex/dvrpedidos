import { Component } from "@angular/core";
import { ActivatedRoute, ParamMap, Router } from "@angular/router";

import {
  ItemPedido,
  ItemPedidoRequest,
  Pedido,
  PedidoRequest,
} from "../../models/pedido/pedido";
import { FormBuilder, Validators } from "@angular/forms";
import { Observable } from "rxjs";
import { Cliente } from "../../models/cliente/cliente";
import { Produto } from "../../models/produto/produto";
import { ConfirmationService, MessageService } from "primeng/api";
import { ApiService } from "../../services/api.service";

@Component({
  selector: "app-formulario-pedido",
  templateUrl: "./formulario-pedido.component.html",
  styleUrl: "./formulario-pedido.component.scss",
})
export class FormularioPedidoComponent {
  id: any;
  pedido = {
    id: 0,
    clienteNome: "",
    clienteTelefone: "",
    clienteCpfCnpj: "",
    clienteEndereco: "",
    itemPedido: [],
    data: "",
    total: 0,
  } as Pedido;
  pedidoRequest = {} as PedidoRequest;
  errorMessage = "Digite um nome válido";
  clientes: Cliente[] = [];
  produtos: Produto[] = [];
  formDisable = false;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private router: Router,
    private confirmationService: ConfirmationService
  ) {}

  userForm = this.fb.group({
    cliente: 0,
    id: 0,
    clienteNome: ["", Validators.required],
    clienteTelefone: "",
    clienteCpfCnpj: "",
    clienteEndereco: "",
    total: 0,
  });

  ngOnInit() {
    this.pedidoRequest.itemPedido = [];
    this.pedido.itemPedido = [];
    this.route.paramMap.subscribe((params: ParamMap) => {
      if (params.has("id")) {
        this.formDisable = true;
        this.id = params.get("id");
        this.findById(this.id);
      }
    });
    this.getClientes();
    this.getProdutos();
  }

  getClientes() {
    this.apiService
      .get<Cliente[]>(`/clientes?`, { page: 0, size: 1000 })
      .subscribe((res: any) => {
        this.clientes = res.content;
      });
  }

  getProdutos() {
    this.apiService
      .get<Produto[]>(`/produtos?`, { page: 0, size: 1000 })
      .subscribe((res: any) => {
        this.produtos = res.content;
      });
  }

  findById(id: number): void {
    this.apiService.getById(`/pedidos/${id}`).subscribe((response: any) => {
      console.log(response);
      this.pedido = response;
      this.userForm.setValue({
        id: this.pedido.id,
        cliente: 0,
        clienteNome: this.pedido.clienteNome,
        clienteCpfCnpj: this.pedido.clienteCpfCnpj,
        clienteEndereco: this.pedido.clienteEndereco,
        clienteTelefone: this.pedido.clienteTelefone,
        total: this.pedido.total,
      });
    });
  }

  handleClienteForm(event: any) {
    const idCliente = event.value;
    let cliente = {} as Cliente;

    cliente = this.clientes.find((c) => c.id === idCliente) ?? ({} as Cliente);
    this.userForm.patchValue({
      clienteNome: cliente.nome,
      clienteCpfCnpj: cliente.cpfcnpj,
      clienteEndereco: cliente.endereco,
      clienteTelefone: cliente.telefone,
    });
    this.pedidoRequest.clienteId = idCliente;
  }

  onAddItemPedido(itemPedido: ItemPedido) {
    this.pedido.itemPedido.push(itemPedido);
  }

  onSubmit() {
    this.savePedido(this.pedidoRequest);
  }

  savePedido(pedidoRequest: PedidoRequest) {
    this.pedido.itemPedido.forEach((itemPedido) => {
      const newItemPedido = {} as ItemPedidoRequest;
      newItemPedido.cor = itemPedido.cor;
      newItemPedido.preco = itemPedido.preco;
      newItemPedido.produto = { id: itemPedido.produto.id };
      newItemPedido.quantidade = itemPedido.quantidade;
      this.pedidoRequest.itemPedido.push(newItemPedido);
    });

    this.apiService.post("/pedidos", pedidoRequest).subscribe({
      next: () => {
        this.messageService.add({
          severity: "info",
          summary: "Confirmado",
          detail: "Pedido salvo",
        });
        setTimeout(() => {
          this.router.navigate(["/pedidos"], {
            relativeTo: this.route,
          });
        }, 1000);
      },
      error: (error) => {
        this.messageService.add({
          severity: "error",
          summary: "Erro: " + error.status,
          detail: "Ocorreu um erro ao salvar pedido",
        });
      },
    });
  }

  deleteItemPedido(itemPedido: ItemPedido) {
    const index = this.pedido.itemPedido.indexOf(itemPedido);
    const x = this.pedido.itemPedido.splice(index, 1);
    console.log(this.pedido.itemPedido);
    console.log(this.pedidoRequest.itemPedido);
  }

  deleteDialog(event: Event, itemPedido: ItemPedido) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Deseja remover  ${itemPedido.produto.nome}?`,
      header: "Confirmação de remoção",
      icon: "pi pi-info-circle",
      acceptButtonStyleClass: "p-button-danger p-button-text",
      rejectButtonStyleClass: "p-button-text p-button-text",
      acceptIcon: "none",
      rejectIcon: "none",

      accept: () => {
        this.deleteItemPedido(itemPedido);
      },
      reject: () => {
        this.messageService.add({
          severity: "error",
          summary: "Rejeitado",
          detail: "Você rejeitou a ação",
        });
      },
    });
  }
  totalPedido(): number {
    const total = this.pedido.itemPedido.reduce(
      (acc, item) => acc + item.total,
      0
    );
    return total;
  }

  backToPedidos() {
    this.router.navigate(["/pedidos"], {
      relativeTo: this.route,
    });
  }
}
