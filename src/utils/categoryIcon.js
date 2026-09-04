import {
  IconCart,
  IconBucket,
  IconDrop2,
  IconDroplet,
  IconBolt,
  IconWifi,
  IconFlame,
  IconWrench,
  IconBuilding,
  IconTag,
} from '../components/ui/Icons.jsx'

const MAP = {
  'cat-supermercado': IconCart,
  'cat-limpeza': IconBucket,
  'cat-higiene': IconDrop2,
  'cat-agua': IconDroplet,
  'cat-energia': IconBolt,
  'cat-internet': IconWifi,
  'cat-gas': IconFlame,
  'cat-manutencao': IconWrench,
  'cat-aluguel': IconBuilding,
  'cat-outros': IconTag,
}

export function getCategoryIcon(categoriaId) {
  return MAP[categoriaId] || IconTag
}
