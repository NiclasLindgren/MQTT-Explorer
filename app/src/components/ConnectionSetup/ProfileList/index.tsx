import React, { useState, useMemo } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { List, TextField, InputAdornment } from '@mui/material'
import Search from '@mui/icons-material/Search'
import { Theme } from '@mui/material/styles'
import { withStyles } from '@mui/styles'
import ConnectionItem from './ConnectionItem'
import { AddButton } from './AddButton'
import { AppState } from '../../../reducers'
import { connectionManagerActions } from '../../../actions'
import { ConnectionOptions } from '../../../model/ConnectionOptions'
import { KeyCodes } from '../../../utils/KeyCodes'
import { useGlobalKeyEventHandler } from '../../../effects/useGlobalKeyEventHandler'

const ConnectionItemAny = ConnectionItem as any

interface Props {
  classes: any
  selected?: string
  connections: { [s: string]: ConnectionOptions }
  actions: typeof connectionManagerActions
}

function ProfileList(props: Props) {
  const { actions, classes, connections, selected } = props
  const [filter, setFilter] = useState('')

  const filteredConnections = useMemo(() => {
    const all = Object.values(connections)
    if (!filter) return all
    const lower = filter.toLowerCase()
    return all.filter(c => c.name.toLowerCase().includes(lower) || c.host.toLowerCase().includes(lower))
  }, [connections, filter])

  const selectConnection = (dir: 'next' | 'previous') => (event: KeyboardEvent) => {
    if (!selected) {
      return
    }
    const indexDirection = dir === 'next' ? 1 : -1
    const connectionArray = filteredConnections
    const selectedIndex = connectionArray.map(connection => connection.id).indexOf(selected)
    const nextConnection = connectionArray[selectedIndex + indexDirection]
    if (nextConnection) {
      actions.selectConnection(nextConnection.id)
    }
    event.preventDefault()
  }

  useGlobalKeyEventHandler(KeyCodes.arrow_down, selectConnection('next'))
  useGlobalKeyEventHandler(KeyCodes.arrow_up, selectConnection('previous'))

  const header = (
    <div style={{ padding: '8px 16px' }}>
      <AddButton action={actions.createConnection} />
      Connections
      <TextField
        size="small"
        placeholder="Filter connections..."
        value={filter}
        onChange={e => setFilter(e.target.value)}
        fullWidth
        variant="outlined"
        style={{ marginTop: 8 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" />
              </InputAdornment>
            ),
          },
        }}
      />
    </div>
  )

  return (
    <List style={{ height: '100%' }} component="nav" subheader={header}>
      <div className={classes.list}>
        {filteredConnections.map(connection => (
          <ConnectionItemAny connection={connection} key={connection.id} selected={selected === connection.id} />
        ))}
      </div>
    </List>
  )
}

const styles = (theme: Theme) => ({
  list: {
    marginTop: theme.spacing(1),
    height: `calc(100% - ${theme.spacing(6)})`,
    overflowY: 'auto' as const,
  },
})

const mapDispatchToProps = (dispatch: any) => ({
  actions: bindActionCreators(connectionManagerActions, dispatch),
})

const mapStateToProps = (state: AppState) => ({
  connections: state.connectionManager.connections,
  selected: state.connectionManager.selected,
})

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(ProfileList) as any)
