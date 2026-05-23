import React, { useState, useEffect } from "react";
import { useCustomer } from "../../../../contexts/CustomerContext";
import { Customer } from "../../../../../domain/entities/Customer";
import { IoClose } from "react-icons/io5";
import { FaUserPlus } from "react-icons/fa6";
import styles from "./createCustomerForm.module.css";

interface Props {
  customer?: Customer;
  initialName?: string;
  onClose: () => void;
  onCreated?: (customer: Customer, id: string) => void;
}

export const CreateCustomerForm: React.FC<Props> = ({
  customer,
  initialName = "",
  onClose,
  onCreated,
}) => {
  const { createCustomer, updateCustomer } = useCustomer();

  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEditing = !!customer;

  useEffect(() => {
    if (customer) {
      setName(customer.name);
      setPhone(customer.phone || "");
      setNotes(customer.notes || "");
    }
  }, [customer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!name.trim() || name.trim().length < 2) {
        throw new Error("Nome deve ter ao menos 2 caracteres.");
      }

      const newCustomer = new Customer({
        id: isEditing ? customer!.id : undefined,
        name: name.trim(),
        phone: phone.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      if (isEditing) {
        await updateCustomer(newCustomer);
        onClose();
      } else {
        const id = await createCustomer(newCustomer);
        if (onCreated) {
          onCreated(newCustomer, id);
        } else {
          onClose();
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}>
            <FaUserPlus />
          </div>
          <div>
            <div className={styles.title}>{isEditing ? "Editar Cliente" : "Novo Cliente Fiado"}</div>
            <div className={styles.sub}>{isEditing ? "Atualize as informações" : "Cadastre um cliente para fiado"}</div>
          </div>
        </div>
        <button className={styles.closeBtn} onClick={onClose}>
          <IoClose />
        </button>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Informações do cliente</div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Nome *</label>
            <input
              className={styles.input}
              type="text"
              placeholder="Nome completo do cliente"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Telefone (opcional)</label>
            <input
              className={styles.input}
              type="tel"
              placeholder="(00) 00000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Observações (opcional)</label>
            <textarea
              className={styles.textarea}
              placeholder="Anotações sobre o cliente..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.actions}>
          <button type="button" className={styles.btnCancel} onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className={styles.btnSubmit} disabled={loading}>
            {loading ? "Salvando…" : isEditing ? "Atualizar" : "Cadastrar Cliente"}
          </button>
        </div>
      </form>
    </div>
  );
};
