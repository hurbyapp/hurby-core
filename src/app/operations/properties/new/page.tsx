'use client'

/*
=========================================================
HURBY — CORE_PROPERTIES_FORM_V1
ARQUIVO:
src/app/operations/properties/new/page.tsx

RESPONSABILIDADE:
Criar o anuncio publico/comercial basico do imovel.

REGRA DE PRODUTO:
- Anuncio e peca publica/comercial.
- Documento Profissional do Imovel e fluxo tecnico separado.
- Fotos aqui sao fotos publicas do anuncio.
- Fotos tecnicas do documento profissional terao estrutura propria futura.
- O preenchimento deve ser leve para acelerar validacao.
- Titulo e o minimo pratico; demais campos ficam opcionais por enquanto.

CODEX:
Pode corrigir portugues, acentuacao e comunicacao diretamente no VS Code/editor,
mantendo UTF-8. Nao alterar arquitetura, regras LGPD, service contracts,
RPCs, nomes tecnicos ou regras de negocio sem missao especifica.

OBSERVACAO:
Textos visiveis foram deixados sem acento neste momento para evitar mojibake
causado pelo terminal PowerShell. Codex deve corrigir depois no editor.
=========================================================
*/

import { useEffect, useState } from 'react'

import { supabase } from '@/lib/supabaseClient'

import {
  createPropertyOperationalBundle,
  getBusinessContexts,
  getListingStatuses,
  getOperationalModels,
  getPropertyListingById,
  getPropertyTypes,
  updatePropertyAssetCommercialDetails,
  uploadPropertyMedia,
  upsertPropertyAssetFeaturesByAssetId,
  upsertPropertyAssetLocationByAssetId,
} from '@/lib/services/propertyService'

function normalizeBrazilianPrice(value: string) {
  if (!value.trim()) return null

  const normalized = Number(
    value.replace(/\./g, '').replace(',', '.')
  )

  return Number.isNaN(normalized) ? null : normalized
}

function normalizeNumber(value: string) {
  if (!value.trim()) return null

  const normalized = Number(
    value.replace(/\./g, '').replace(',', '.')
  )

  return Number.isNaN(normalized) ? null : normalized
}

function getFirstId(items: any[]) {
  return items?.[0]?.id || ''
}

export default function NewPropertyPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<any>(null)

  const [propertyTypes, setPropertyTypes] = useState<any[]>([])
  const [operationalModels, setOperationalModels] = useState<any[]>([])
  const [businessContexts, setBusinessContexts] = useState<any[]>([])
  const [listingStatuses, setListingStatuses] = useState<any[]>([])

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [condoFee, setCondoFee] = useState('')
  const [iptuValue, setIptuValue] = useState('')

  const [propertyTypeId, setPropertyTypeId] = useState('')
  const [operationalModelId, setOperationalModelId] = useState('')
  const [businessContextId, setBusinessContextId] = useState('')
  const [listingStatusId, setListingStatusId] = useState('')

  const [propertyStandard, setPropertyStandard] = useState('')
  const [condominiumName, setCondominiumName] = useState('')
  const [buildingName, setBuildingName] = useState('')
  const [isGatedCommunity, setIsGatedCommunity] = useState(false)
  const [hasCondominiumPool, setHasCondominiumPool] = useState(false)
  const [acceptsFinancing, setAcceptsFinancing] = useState(false)
  const [hasGym, setHasGym] = useState(false)

  const [zipCode, setZipCode] = useState('')
  const [state, setState] = useState('')
  const [city, setCity] = useState('')
  const [neighborhood, setNeighborhood] = useState('')
  const [street, setStreet] = useState('')
  const [number, setNumber] = useState('')
  const [complement, setComplement] = useState('')
  const [hidePublicNumber, setHidePublicNumber] = useState(true)

  const [bedrooms, setBedrooms] = useState('')
  const [suites, setSuites] = useState('')
  const [bathrooms, setBathrooms] = useState('')
  const [garageSpaces, setGarageSpaces] = useState('')
  const [privateArea, setPrivateArea] = useState('')
  const [totalArea, setTotalArea] = useState('')
  const [builtYear, setBuiltYear] = useState('')
  const [floorNumber, setFloorNumber] = useState('')
  const [totalFloors, setTotalFloors] = useState('')
  const [hasElevator, setHasElevator] = useState(false)
  const [isFurnished, setIsFurnished] = useState(false)
  const [hasPrivatePool, setHasPrivatePool] = useState(false)
  const [sunPosition, setSunPosition] = useState('')

  const [isExclusive, setIsExclusive] = useState(false)
  const [isAvailableForPartnership, setIsAvailableForPartnership] = useState(false)
  const [followToProfessionalDocument, setFollowToProfessionalDocument] = useState(false)

  const [mediaFiles, setMediaFiles] = useState<File[]>([])
  const [coverFileName, setCoverFileName] = useState('')

  const [status, setStatus] = useState('')

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        window.location.href = '/login'
        return
      }

      setUser(user)

      const [types, models, contexts, statuses] = await Promise.all([
        getPropertyTypes(),
        getOperationalModels(),
        getBusinessContexts(),
        getListingStatuses(),
      ])

      setPropertyTypes(types.data || [])
      setOperationalModels(models.data || [])
      setBusinessContexts(contexts.data || [])
      setListingStatuses(statuses.data || [])

      setPropertyTypeId(types.data?.[0]?.id || '')
      setOperationalModelId(models.data?.[0]?.id || '')
      setBusinessContextId(contexts.data?.[0]?.id || '')
      setListingStatusId(statuses.data?.[0]?.id || '')

      setLoading(false)
    }

    init()
  }, [])

  const handleMediaChange = (files: FileList | null) => {
    const selectedFiles = Array.from(files || [])

    setMediaFiles(selectedFiles)

    if (selectedFiles.length > 0 && !coverFileName) {
      setCoverFileName(selectedFiles[0].name)
    }
  }

  const handleCreate = async () => {
    if (!title.trim()) {
      setStatus('Informe pelo menos o titulo do anuncio.')
      return
    }

    if (mediaFiles.length > 22) {
      setStatus('Limite base: ate 22 fotos por anuncio. Acima disso sera monetizavel futuramente.')
      return
    }

    const finalPropertyTypeId =
      propertyTypeId || getFirstId(propertyTypes)

    const finalOperationalModelId =
      operationalModelId || getFirstId(operationalModels)

    const finalBusinessContextId =
      businessContextId || getFirstId(businessContexts)

    const finalListingStatusId =
      listingStatusId || getFirstId(listingStatuses)

    if (
      !finalPropertyTypeId ||
      !finalOperationalModelId ||
      !finalBusinessContextId ||
      !finalListingStatusId
    ) {
      setStatus('Cadastros basicos de tipo/modelo/contexto/status nao encontrados. Revise a base antes de criar anuncio.')
      return
    }

    try {
      setSaving(true)
      setStatus('Criando anuncio...')

      const response = await createPropertyOperationalBundle({
        userId: user.id,
        property_type_id: finalPropertyTypeId,
        operational_model_id: finalOperationalModelId,
        property_business_context_id: finalBusinessContextId,
        listing_status_id: finalListingStatusId,
        title,
        description,
        price: normalizeBrazilianPrice(price),
        visibility_scope: 'private',
      })

      if (response.error) {
        setStatus(response.error.message || 'Erro ao criar anuncio.')
        setSaving(false)
        return
      }

      const listingId = response.data?.listing?.id

      if (!listingId) {
        setStatus('Anuncio criado, mas sem listing_id no retorno. Pare e revise.')
        setSaving(false)
        return
      }

      const detailResponse = await getPropertyListingById(listingId)

      if (detailResponse.error || !detailResponse.data?.property_assets?.id) {
        setStatus(detailResponse.error?.message || 'Anuncio criado, mas nao foi possivel localizar o asset do imovel.')
        setSaving(false)
        return
      }

      const assetId = detailResponse.data.property_assets.id

      setStatus('Salvando dados complementares do imovel...')

      const assetResponse = await updatePropertyAssetCommercialDetails(
        assetId,
        {
          property_standard: propertyStandard,
          condominium_name: condominiumName,
          building_name: buildingName,
          is_gated_community: isGatedCommunity,
          has_condominium_pool: hasCondominiumPool,
          accepts_financing: acceptsFinancing,
          metadata: {
            has_gym: hasGym,
            is_exclusive: isExclusive,
            is_available_for_partnership: isAvailableForPartnership,
            cover_file_name: coverFileName || null,
            form_origin: 'operations_properties_new',
            condo_fee: normalizeBrazilianPrice(condoFee),
            iptu_value: normalizeBrazilianPrice(iptuValue),
          },
        }
      )

      if (assetResponse.error) {
        setStatus(assetResponse.error.message || 'Erro ao salvar dados do imovel.')
        setSaving(false)
        return
      }

      const locationResponse = await upsertPropertyAssetLocationByAssetId(
        assetId,
        {
          zip_code: zipCode,
          zipcode: zipCode,
          state,
          city,
          neighborhood,
          street,
          number,
          complement,
          hide_public_number: hidePublicNumber,
        }
      )

      if (locationResponse.error) {
        setStatus(locationResponse.error.message || 'Erro ao salvar localizacao.')
        setSaving(false)
        return
      }

      const featuresResponse = await upsertPropertyAssetFeaturesByAssetId(
        assetId,
        {
          bedrooms: normalizeNumber(bedrooms),
          suites: normalizeNumber(suites),
          bathrooms: normalizeNumber(bathrooms),
          garage_spaces: normalizeNumber(garageSpaces),
          private_area: normalizeNumber(privateArea),
          total_area: normalizeNumber(totalArea),
          built_year: normalizeNumber(builtYear),
          floor_number: normalizeNumber(floorNumber),
          total_floors: normalizeNumber(totalFloors),
          has_elevator: hasElevator,
          is_furnished: isFurnished,
          furnished: isFurnished,
          has_private_pool: hasPrivatePool,
          sun_position: sunPosition,
        }
      )

      if (featuresResponse.error) {
        setStatus(featuresResponse.error.message || 'Erro ao salvar caracteristicas.')
        setSaving(false)
        return
      }

      const selectedFiles = Array.from(mediaFiles)

      if (selectedFiles.length > 0) {
        setStatus(`Enviando ${selectedFiles.length} foto(s)...`)

        for (let index = 0; index < selectedFiles.length; index++) {
          const file = selectedFiles[index]

          setStatus(`Enviando foto ${index + 1} de ${selectedFiles.length}: ${file.name}`)

          const mediaResponse = await uploadPropertyMedia(file, listingId)

          if (mediaResponse.error) {
            setStatus(mediaResponse.error.message || `Erro ao enviar foto: ${file.name}`)
            setSaving(false)
            return
          }
        }
      }

      setStatus('Anuncio criado com sucesso.')

      setTimeout(() => {
        if (followToProfessionalDocument) {
          window.location.href = `/operations/properties/${listingId}/assessment`
          return
        }

        window.location.href = '/operations/properties/list'
      }, 700)
    } catch (error) {
      console.error(error)
      setStatus('Erro interno ao criar anuncio.')
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main style={{ padding: 24 }}>
        <p>Carregando formulario...</p>
      </main>
    )
  }

  return (
    <main style={{ padding: 24, maxWidth: 1080, margin: '0 auto' }}>
      <style jsx global>{`
        input,
        textarea,
        select {
          border: 1px solid #999;
          border-radius: 8px;
          padding: 8px 10px;
          min-height: 36px;
          box-sizing: border-box;
          background: #fff;
        }

        textarea {
          min-height: 90px;
        }

        button,
        .button-link {
          border: 1px solid #333;
          border-radius: 8px;
          padding: 8px 12px;
          background: #fff;
          color: #111;
          text-decoration: none;
          display: inline-block;
          cursor: pointer;
          margin-right: 8px;
          margin-bottom: 8px;
        }

        .hurby-section {
          border: 1px solid #ddd;
          border-radius: 12px;
          padding: 16px;
          margin: 16px 0;
          background: #fff;
        }

        .grid-two {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }

        .grid-three {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
        }

        .field-full {
          grid-column: 1 / -1;
        }

        .muted {
          color: #666;
          font-size: 14px;
        }

        @media (max-width: 760px) {
          .grid-two,
          .grid-three {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <p>
        <a className="button-link" href="/operations/properties/list">
          Voltar para lista
        </a>

        <a className="button-link" href="/operations/properties">
          Voltar para imoveis
        </a>
      </p>

      <h1>Novo anuncio de imovel</h1>

      <div className="hurby-section">
        <h2>Orientacao</h2>

        <p>
          Voce esta criando o anuncio comercial do imovel. Este cadastro pode
          ser usado para divulgacao, vitrine profissional, marketplace e leads.
        </p>

        <p>
          O Documento Profissional do Imovel e separado. Ele serve para
          avaliacao tecnica, entrevista com proprietario, estrategia, documentos
          e observacoes internas.
        </p>

        <p className="muted">
          Para facilitar testes, apenas o titulo e tratado como minimo pratico.
          Os demais campos podem ser preenchidos agora ou refinados depois.
        </p>
      </div>

      <section className="hurby-section">
        <h2>1. Dados comerciais do anuncio</h2>

        <div className="grid-two">
          <label className="field-full">
            Titulo do anuncio
            <br />
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              style={{ width: '100%' }}
            />
          </label>

          <label className="field-full">
            Descricao publica
            <br />
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
              style={{ width: '100%' }}
            />
          </label>

          <label>
            Valor principal
            <br />
            <input
              placeholder="Ex: 350.000,00"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              style={{ width: '100%' }}
            />
          </label>

          <label>
            Valor do condominio
            <br />
            <input
              placeholder="Ex: 850,00"
              value={condoFee}
              onChange={(event) => setCondoFee(event.target.value)}
              style={{ width: '100%' }}
            />
          </label>

          <label>
            IPTU
            <br />
            <input
              placeholder="Ex: 1.200,00"
              value={iptuValue}
              onChange={(event) => setIptuValue(event.target.value)}
              style={{ width: '100%' }}
            />
          </label>

          <label>
            Finalidade do anuncio
            <br />
            <select
              value={businessContextId}
              onChange={(event) => setBusinessContextId(event.target.value)}
              style={{ width: '100%' }}
            >
              <option value="">Usar padrao da base</option>
              {businessContexts.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            Status do anuncio
            <br />
            <select
              value={listingStatusId}
              onChange={(event) => setListingStatusId(event.target.value)}
              style={{ width: '100%' }}
            >
              <option value="">Usar padrao da base</option>
              {listingStatuses.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="hurby-section">
        <h2>2. Tipo, padrao e condominio</h2>

        <div className="grid-two">
          <label>
            Tipo do imovel
            <br />
            <select
              value={propertyTypeId}
              onChange={(event) => setPropertyTypeId(event.target.value)}
              style={{ width: '100%' }}
            >
              <option value="">Usar padrao da base</option>
              {propertyTypes.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            Forma de operacao
            <br />
            <select
              value={operationalModelId}
              onChange={(event) => setOperationalModelId(event.target.value)}
              style={{ width: '100%' }}
            >
              <option value="">Usar padrao da base</option>
              {operationalModels.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            Padrao do imovel
            <br />
            <select
              value={propertyStandard}
              onChange={(event) => setPropertyStandard(event.target.value)}
              style={{ width: '100%' }}
            >
              <option value="">Nao informado</option>
              <option value="popular">Popular</option>
              <option value="standard">Padrao</option>
              <option value="medium">Medio</option>
              <option value="elevated">Elevado</option>
              <option value="high">Alto</option>
              <option value="luxury">Luxo</option>
            </select>
          </label>

          <label>
            Nome do condominio
            <br />
            <input
              value={condominiumName}
              onChange={(event) => setCondominiumName(event.target.value)}
              style={{ width: '100%' }}
            />
          </label>

          <label>
            Nome do edificio
            <br />
            <input
              value={buildingName}
              onChange={(event) => setBuildingName(event.target.value)}
              style={{ width: '100%' }}
            />
          </label>

          <div>
            <label>
              <input
                type="checkbox"
                checked={isGatedCommunity}
                onChange={(event) => setIsGatedCommunity(event.target.checked)}
              />
              {' '}
              Condominio fechado
            </label>
            <br />
            <label>
              <input
                type="checkbox"
                checked={hasCondominiumPool}
                onChange={(event) => setHasCondominiumPool(event.target.checked)}
              />
              {' '}
              Piscina no condominio
            </label>
            <br />
            <label>
              <input
                type="checkbox"
                checked={hasGym}
                onChange={(event) => setHasGym(event.target.checked)}
              />
              {' '}
              Academia
            </label>
          </div>
        </div>
      </section>

      <section className="hurby-section">
        <h2>3. Localizacao</h2>

        <p className="muted">
          O numero do imovel fica oculto publicamente por padrao.
        </p>

        <div className="grid-three">
          <label>
            CEP
            <br />
            <input value={zipCode} onChange={(event) => setZipCode(event.target.value)} style={{ width: '100%' }} />
          </label>

          <label>
            UF
            <br />
            <input value={state} onChange={(event) => setState(event.target.value)} style={{ width: '100%' }} />
          </label>

          <label>
            Cidade
            <br />
            <input value={city} onChange={(event) => setCity(event.target.value)} style={{ width: '100%' }} />
          </label>

          <label>
            Bairro
            <br />
            <input value={neighborhood} onChange={(event) => setNeighborhood(event.target.value)} style={{ width: '100%' }} />
          </label>

          <label>
            Rua
            <br />
            <input value={street} onChange={(event) => setStreet(event.target.value)} style={{ width: '100%' }} />
          </label>

          <label>
            Numero
            <br />
            <input value={number} onChange={(event) => setNumber(event.target.value)} style={{ width: '100%' }} />
          </label>

          <label className="field-full">
            Complemento
            <br />
            <input value={complement} onChange={(event) => setComplement(event.target.value)} style={{ width: '100%' }} />
          </label>
        </div>

        <br />

        <label>
          <input
            type="checkbox"
            checked={hidePublicNumber}
            onChange={(event) => setHidePublicNumber(event.target.checked)}
          />
          {' '}
          Ocultar numero do imovel publicamente
        </label>
      </section>

      <section className="hurby-section">
        <h2>4. Caracteristicas do imovel</h2>

        <div className="grid-three">
          <label>
            Quartos
            <br />
            <input value={bedrooms} onChange={(event) => setBedrooms(event.target.value)} style={{ width: '100%' }} />
          </label>

          <label>
            Suites
            <br />
            <input value={suites} onChange={(event) => setSuites(event.target.value)} style={{ width: '100%' }} />
          </label>

          <label>
            Banheiros
            <br />
            <input value={bathrooms} onChange={(event) => setBathrooms(event.target.value)} style={{ width: '100%' }} />
          </label>

          <label>
            Vagas
            <br />
            <input value={garageSpaces} onChange={(event) => setGarageSpaces(event.target.value)} style={{ width: '100%' }} />
          </label>

          <label>
            Area privativa
            <br />
            <input value={privateArea} onChange={(event) => setPrivateArea(event.target.value)} style={{ width: '100%' }} />
          </label>

          <label>
            Area total
            <br />
            <input value={totalArea} onChange={(event) => setTotalArea(event.target.value)} style={{ width: '100%' }} />
          </label>

          <label>
            Ano de construcao
            <br />
            <input value={builtYear} onChange={(event) => setBuiltYear(event.target.value)} style={{ width: '100%' }} />
          </label>

          <label>
            Andar
            <br />
            <input value={floorNumber} onChange={(event) => setFloorNumber(event.target.value)} style={{ width: '100%' }} />
          </label>

          <label>
            Total de andares
            <br />
            <input value={totalFloors} onChange={(event) => setTotalFloors(event.target.value)} style={{ width: '100%' }} />
          </label>

          <label>
            Posicao solar
            <br />
            <select value={sunPosition} onChange={(event) => setSunPosition(event.target.value)} style={{ width: '100%' }}>
              <option value="">Nao informado</option>
              <option value="morning">Sol da manha</option>
              <option value="afternoon">Sol da tarde</option>
              <option value="north">Norte</option>
              <option value="south">Sul</option>
              <option value="east">Leste</option>
              <option value="west">Oeste</option>
            </select>
          </label>

          <div>
            <label>
              <input type="checkbox" checked={hasElevator} onChange={(event) => setHasElevator(event.target.checked)} />
              {' '}
              Elevador
            </label>
            <br />
            <label>
              <input type="checkbox" checked={isFurnished} onChange={(event) => setIsFurnished(event.target.checked)} />
              {' '}
              Mobiliado
            </label>
            <br />
            <label>
              <input type="checkbox" checked={hasPrivatePool} onChange={(event) => setHasPrivatePool(event.target.checked)} />
              {' '}
              Piscina privativa
            </label>
          </div>
        </div>
      </section>

      <section className="hurby-section">
        <h2>5. Regras comerciais e compartilhamento</h2>

        <p className="muted">
          Mesmo quando houver parceria futura, o numero exato do imovel deve ser protegido por padrao.
        </p>

        <label>
          <input
            type="checkbox"
            checked={isExclusive}
            onChange={(event) => setIsExclusive(event.target.checked)}
          />
          {' '}
          Imovel exclusivo
        </label>

        <br />

        <label>
          <input
            type="checkbox"
            checked={isAvailableForPartnership}
            onChange={(event) => setIsAvailableForPartnership(event.target.checked)}
          />
          {' '}
          Pode ser compartilhado em parceria
        </label>

        <br />

        <label>
          <input
            type="checkbox"
            checked={acceptsFinancing}
            onChange={(event) => setAcceptsFinancing(event.target.checked)}
          />
          {' '}
          Aceita financiamento
        </label>
      </section>

      <section className="hurby-section">
        <h2>6. Fotos publicas do anuncio</h2>

        <p className="muted">
          Envie apenas fotos que podem aparecer no anuncio. Limite base: ate 22 fotos.
        </p>

        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(event) => handleMediaChange(event.target.files)}
        />

        <p>Arquivos selecionados: {mediaFiles.length}</p>

        {mediaFiles.length > 0 && (
          <>
            <label>
              Foto de capa
              <br />
              <select
                value={coverFileName}
                onChange={(event) => setCoverFileName(event.target.value)}
                style={{ width: '100%' }}
              >
                {mediaFiles.map((file) => (
                  <option key={`${file.name}-${file.size}`} value={file.name}>
                    {file.name}
                  </option>
                ))}
              </select>
            </label>

            <ul>
              {mediaFiles.map((file) => (
                <li key={`${file.name}-${file.size}`}>
                  {file.name}
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <section className="hurby-section">
        <h2>7. Proximo passo</h2>

        <label>
          <input
            type="checkbox"
            checked={followToProfessionalDocument}
            onChange={(event) => setFollowToProfessionalDocument(event.target.checked)}
          />
          {' '}
          Depois de salvar, criar Documento Profissional do Imovel
        </label>

        <p className="muted">
          Se marcado, voce sera direcionado ao documento tecnico interno do imovel.
          Se nao marcado, voltara para a lista de imoveis.
        </p>
      </section>

      <button onClick={handleCreate} disabled={saving}>
        {saving ? 'Salvando...' : 'Criar anuncio'}
      </button>

      <br />
      <br />

      {status && <p>{status}</p>}
    </main>
  )
}