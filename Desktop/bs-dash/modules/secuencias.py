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
        if not os.path.exists(self.data_dir):
            os.makedirs(self.data_dir)
    
    def _load_sequences(self):
        if os.path.exists(self.sequences_file):
            with open(self.sequences_file, 'r', encoding='utf-8') as f:
                self.sequences = json.load(f)
        else:
            self.sequences = {
                "quotations": {"prefix": "COT", "next_number": 1, "padding": 6},
                "invoices": {"prefix": "FAC", "next_number": 1, "padding": 6},
                "payments": {"prefix": "PAG", "next_number": 1, "padding": 6},
                "reports": {"prefix": "REP", "next_number": 1, "padding": 6},
                "cash_closing": {"prefix": "CIERRE", "next_number": 1, "padding": 4}
            }
            self._save_sequences()
    
    def _save_sequences(self):
        with open(self.sequences_file, 'w', encoding='utf-8') as f:
            json.dump(self.sequences, f, indent=4, ensure_ascii=False)
    
    def get_next_sequence(self, sequence_type):
        if sequence_type not in self.sequences:
            raise ValueError(f"Tipo de secuencia no válido: {sequence_type}")
        sequence = self.sequences[sequence_type]
        next_num = sequence["next_number"]
        prefix = sequence["prefix"]
        padding = sequence["padding"]
        formatted_num = str(next_num).zfill(padding)
        sequence_number = f"{prefix}-{formatted_num}"
        sequence["next_number"] += 1
        self._save_sequences()
        return sequence_number
    
    def get_all_sequences(self):
        return self.sequences

# PRUEBA DIRECTA - ELIMINA EL if __name__
sm = SequenceManager()
print("Secuencias actuales:", sm.get_all_sequences())
print("Próxima factura:", sm.get_next_sequence("invoices"))
print("Próxima cotización:", sm.get_next_sequence("quotations"))