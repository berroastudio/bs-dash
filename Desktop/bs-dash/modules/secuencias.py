import json
import os
from datetime import datetime

class SequenceManager:
    def __init__(self, data_dir="data"):
        self.data_dir = data_dir
        self.sequences_file = os.path.join(data_dir, "sequences.json")
        self._ensure_data_dir()
        self._load_sequences()
    
    def _ensure_data_dir(self):
        """Asegura que exista el directorio data/"""
        if not os.path.exists(self.data_dir):
            os.makedirs(self.data_dir)
    
    def _load_sequences(self):
        """Carga las secuencias desde el archivo JSON o crea las predeterminadas"""
        if os.path.exists(self.sequences_file):
            with open(self.sequences_file, 'r', encoding='utf-8') as f:
                self.sequences = json.load(f)
        else:
            # Secuencias por defecto
            self.sequences = {
                "quotations": {
                    "prefix": "COT", 
                    "next_number": 1, 
                    "padding": 6,
                    "description": "Cotizaciones"
                },
                "invoices": {
                    "prefix": "FAC", 
                    "next_number": 1, 
                    "padding": 6,
                    "description": "Facturas"
                },
                "payments": {
                    "prefix": "PAG", 
                    "next_number": 1, 
                    "padding": 6,
                    "description": "Pagos"
                },
                "reports": {
                    "prefix": "REP", 
                    "next_number": 1, 
                    "padding": 6,
                    "description": "Reportes"
                },
                "cash_closing": {
                    "prefix": "CIERRE", 
                    "next_number": 1, 
                    "padding": 4,
                    "description": "Cierres de Caja"
                }
            }
            self._save_sequences()
    
    def _save_sequences(self):
        """Guarda las secuencias en el archivo JSON"""
        with open(self.sequences_file, 'w', encoding='utf-8') as f:
            json.dump(self.sequences, f, indent=4, ensure_ascii=False)
    
    def get_next_sequence(self, sequence_type):
        """Obtiene el próximo número de secuencia y incrementa el contador"""
        if sequence_type not in self.sequences:
            raise ValueError(f"Tipo de secuencia no válido: {sequence_type}")
        
        sequence = self.sequences[sequence_type]
        next_num = sequence["next_number"]
        prefix = sequence["prefix"]
        padding = sequence["padding"]
        
        # Formatear número con padding (ej: 1 -> 000001)
        formatted_num = str(next_num).zfill(padding)
        sequence_number = f"{prefix}-{formatted_num}"
        
        # Incrementar para próximo uso
        sequence["next_number"] += 1
        self._save_sequences()
        
        return sequence_number
    
    def update_sequence(self, sequence_type, prefix, next_number, padding):
        """Actualiza la configuración de una secuencia"""
        if sequence_type in self.sequences:
            self.sequences[sequence_type].update({
                "prefix": prefix,
                "next_number": next_number,
                "padding": padding
            })
            self._save_sequences()
            return True
        return False
    
    def get_all_sequences(self):
        """Obtiene todas las secuencias"""
        return self.sequences
    
    def get_sequence_info(self, sequence_type):
        """Obtiene información de una secuencia específica"""
        return self.sequences.get(sequence_type)

# PRUEBA DIRECTA - EJECUCIÓN SIEMPRE
print("=== INICIANDO PRUEBA DEL SISTEMA DE SECUENCIAS ===")
sm = SequenceManager()
print("Secuencias actuales:", sm.get_all_sequences())
print("Próxima factura:", sm.get_next_sequence("invoices"))
print("Próxima cotización:", sm.get_next_sequence("quotations"))
print("Próximo pago:", sm.get_next_sequence("payments"))
print("=== PRUEBA COMPLETADA ===")