package com.ank.pedidos.repositories;

import com.ank.pedidos.entities.Pedido;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PedidoRepository extends JpaRepository <Pedido, Long> {
}
